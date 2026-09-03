from prophet import Prophet
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date, timedelta
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
import numpy as np

# === 環境変数ロード ===
load_dotenv()

DB_URL = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:example@db:5432/jobs"

def get_openai_client():
    api_key = os.getenv("AZURE_OPENAI_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    if not api_key or not endpoint:
        return None
    return AzureOpenAI(
        api_key=api_key,
        api_version="2024-12-01-preview",
        azure_endpoint=endpoint,
    )

def get_connection():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:example@db:5432/jobs"
    if os.path.exists("/.dockerenv") and "localhost" in url:
        url = url.replace("localhost", "db")
    return psycopg2.connect(url)

def main():
    print("=== [Trend Forecast] Starting Job Count Forecasting ===")
    
    with get_connection() as conn:
        query = """
            SELECT collected_date, sum(job_count) AS job_count
            FROM prefecture_job_counts
            GROUP BY collected_date
            ORDER BY collected_date ASC;
        """
        df = pd.read_sql(query, conn)

    if df.empty:
        print("データが取得できませんでした。")
        return

    df["collected_date"] = pd.to_datetime(df["collected_date"])

    # 長期ギャップ（7日以上欠損）がある場合は直近の連続データセグメントを使用
    df["date_diff"] = df["collected_date"].diff().dt.days
    split_points = df[df["date_diff"] > 7].index
    if len(split_points) > 0:
        recent_df = df.loc[split_points[-1]:].copy().reset_index(drop=True)
    else:
        recent_df = df.copy()

    # 欠損日を日次で補完（直近期間）
    all_dates = pd.date_range(
        start=recent_df["collected_date"].min(),
        end=recent_df["collected_date"].max(),
        freq="D"
    )
    recent_df = pd.merge(
        pd.DataFrame({"collected_date": all_dates}),
        recent_df[["collected_date", "job_count"]],
        on="collected_date",
        how="left"
    )

    median_val = recent_df["job_count"].dropna().median()
    if pd.isna(median_val) or median_val <= 0:
        median_val = 50.0

    # 欠損日は直近中央値で補完
    recent_df["job_count"] = recent_df["job_count"].fillna(median_val)

    # 初回一括取得等の極端なスパイク（外れ値）を平滑化
    recent_df["job_count_clean"] = np.where(
        recent_df["job_count"] > median_val * 2.5,
        median_val * 1.5,
        recent_df["job_count"]
    )

    print(f"学習データ件数: {len(recent_df)}日分 (最新: {recent_df['collected_date'].max().strftime('%Y-%m-%d')})")

    # 曜日ごとの季節性比率を計算
    recent_df["weekday"] = recent_df["collected_date"].dt.weekday
    weekday_means = recent_df.groupby("weekday")["job_count_clean"].mean()
    overall_mean = recent_df["job_count_clean"].mean()
    weekday_factors = (weekday_means / overall_mean).fillna(1.0).to_dict()

    # 対数変換で Prophet モデルを学習（0以下の予測を防ぐ）
    df_prophet = recent_df[["collected_date", "job_count_clean"]].rename(
        columns={"collected_date": "ds", "job_count_clean": "y"}
    )
    df_prophet["y_log"] = np.log1p(df_prophet["y"])

    m = Prophet(
        changepoint_prior_scale=0.01,
        weekly_seasonality=True,
        yearly_seasonality=False,
        daily_seasonality=False
    )
    m.fit(df_prophet[["ds", "y_log"]].rename(columns={"y_log": "y"}))

    future = m.make_future_dataframe(periods=14)
    forecast = m.predict(future)

    # 逆変換
    forecast["yhat"] = np.expm1(forecast["yhat"])
    forecast["yhat_lower"] = np.expm1(forecast["yhat_lower"])
    forecast["yhat_upper"] = np.expm1(forecast["yhat_upper"])

    # 直近3日間の加重平均からベースライン下限を計算
    tail_vals = recent_df["job_count_clean"].tail(3).values
    weights = [0.2, 0.3, 0.5][:len(tail_vals)]
    weights = [w / sum(weights) for w in weights]
    recent_wma = sum(v * w for v, w in zip(tail_vals, weights))
    base_floor = max(30, int(recent_wma * 0.65))

    forecast_future = forecast.tail(14).copy()
    rows = []

    for idx, row in forecast_future.iterrows():
        w = row["ds"].weekday()
        wf = weekday_factors.get(w, 1.0)
        # 平滑化トレンドと曜日変動を合成
        pred_val = int(round(max(base_floor, row["yhat"]) * (0.85 + 0.15 * wf)))
        lower_val = max(10, int(round(pred_val * 0.75)))
        upper_val = int(round(pred_val * 1.35))
        
        rows.append((
            row["ds"].date().isoformat(),
            pred_val,
            lower_val,
            upper_val,
            "v1"
        ))

    print(f"予測完了（14日分）: 先頭={rows[0]}, 末尾={rows[-1]}")

    # === job_trend_forecast テーブルを更新 ===
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE job_trend_forecast RESTART IDENTITY;")
            execute_values(
                cur,
                """
                INSERT INTO job_trend_forecast (date, predicted_count, lower_bound, upper_bound, model_version)
                VALUES %s;
                """,
                rows,
            )
            conn.commit()

    print(f"✅ {len(rows)}件の予測データを job_trend_forecast に保存しました。")

    # === AIコメント生成（予測用） ===
    client = get_openai_client()
    summary_forecast = None
    if client:
        prompt_forecast = f"""
あなたはIT業界の採用・技術動向を分析する専門アナリストです。
以下の求人件数予測データ（向こう14日分の日次推移）をもとに、ITエンジニア市場の「変化」と「推奨アクション」を分かりやすく解説してください。

出力フォーマット：
- トレンド分析: （今後の予測傾向を簡潔に）
- 市場の解釈: （背景や要因）
- 提案: （採用担当者や求職者へのアドバイス）

データ:
{rows}
"""
        try:
            comment = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt_forecast}],
                temperature=0.4,
            )
            summary_forecast = comment.choices[0].message.content.strip()
        except Exception as e:
            print(f"AIコメント生成（予測）失敗: {e}")

    if not summary_forecast:
        avg_p = int(np.mean([r[1] for r in rows]))
        summary_forecast = (
            f"- トレンド分析: 今後14日間の求人件数は1日あたり平均約{avg_p}件で安定して推移する見込みです。\n"
            f"- 市場の解釈: 急激な減少は見られず、平日を中心とした安定した募集需要が継続しています。\n"
            f"- 提案: 安定期のため、求めるスキルセットの明確化と早期のアプローチが採用成功の鍵となります。"
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO job_insights (date, summary, model_version)
                VALUES (%s, %s, %s)
                """,
                (date.today().isoformat(), summary_forecast, "gpt-4o-mini"),
            )
            conn.commit()

    print("✅ AIコメント（予測）を登録しました。")

    # === AIコメント生成（過去トレンド用） ===
    summary_past = None
    if client:
        prompt_trend = f"""
あなたはIT業界の採用・技術動向を分析する専門アナリストです。
以下の直近の求人件数データをもとに、ITエンジニア市場の「現状」と「推奨アクション」を簡潔にまとめてください。

出力フォーマット：
- 求人数の推移: （現状の総括）
- 市場の解釈: （背景要因）
- 提案: （具体的なアクション）

データ:
{recent_df[['collected_date', 'job_count_clean']].tail(7).to_string(index=False)}
"""
        try:
            comment2 = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt_trend}],
                temperature=0.4,
            )
            summary_past = comment2.choices[0].message.content.strip()
        except Exception as e:
            print(f"AIコメント生成（過去）失敗: {e}")

    if not summary_past:
        recent_sum = int(recent_df['job_count_clean'].tail(7).sum())
        summary_past = (
            f"- 求人数の推移: 直近1週間で合計約{recent_sum}件の求人が確認されています。\n"
            f"- 市場の解釈: 特定分野に偏らず堅調な採用ニーズが続いています。\n"
            f"- 提案: 人気スキル保有者の獲得競争に備え、選考プロセスのスピードアップを推奨します。"
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO job_count_summary (date, summary, model_version)
                VALUES (%s, %s, %s)
                """,
                (date.today().isoformat(), summary_past, "gpt-4o-mini"),
            )
            conn.commit()

    print("✅ AIコメント（過去トレンド）を登録しました。")

if __name__ == "__main__":
    main()
