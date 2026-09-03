import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression
import numpy as np
from openai import AzureOpenAI

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

# === DB接続関数 ===
def get_connection():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:example@db:5432/jobs"
    if os.path.exists("/.dockerenv") and "localhost" in url:
        url = url.replace("localhost", "db")
    return psycopg2.connect(url)

def main():
    print("=== [Trend Score] Calculating Skill Trends ===")
    
    # === jobsテーブルからデータ取得 ===
    with get_connection() as conn:
        query = """
            SELECT id, collected_date, skills
            FROM jobs
            WHERE collected_date IS NOT NULL;
        """
        df = pd.read_sql(query, conn)

    if df.empty:
        print("jobsテーブルにデータがありません。")
        return

    # === 前処理 ===
    df["collected_date"] = pd.to_datetime(df["collected_date"], errors="coerce")
    df = df.dropna(subset=["skills", "collected_date"])

    # skillsカラム（text[]）をexplodeする
    df["skills"] = df["skills"].apply(lambda s: [x.strip().lower() for x in s if x.strip()])
    df = df.explode("skills").reset_index(drop=True)

    # === スキル×日次で件数集計 ===
    trend = (
        df.groupby(["collected_date", "skills"])
          .agg(count=("id", "count"))
          .reset_index()
    )

    # 欠損日を補完
    all_dates = pd.date_range(
        start=df["collected_date"].min().normalize(),
        end=df["collected_date"].max().normalize(),
        freq="D"
    )

    filled_trends = []
    for skill in trend["skills"].unique():
        sub = trend[trend["skills"] == skill].copy()
        sub = pd.merge(
            pd.DataFrame({"collected_date": all_dates}),
            sub,
            on="collected_date",
            how="left"
        )
        sub["skills"] = skill
        sub["count"] = sub["count"].fillna(0)
        filled_trends.append(sub)

    trend = pd.concat(filled_trends, ignore_index=True)

    # === 成長スコア算出（線形回帰の傾き） ===
    slopes = []
    for skill in trend["skills"].unique():
        sub = trend[trend["skills"] == skill].copy()
        if len(sub) >= 5:
            X = np.arange(len(sub)).reshape(-1, 1)
            y = sub["count"].values
            model = LinearRegression().fit(X, y)
            slope = model.coef_[0]
            latest_count = sub.iloc[-1]["count"]
            slopes.append({
                "skill": skill,
                "trend_score": float(slope),
                "latest_count": int(latest_count)
            })

    trend_df = pd.DataFrame(slopes)
    trend_df = trend_df.sort_values(by="trend_score", ascending=False)

    # === skill_trendsテーブルへ登録 ===
    today = datetime.now().date().isoformat()

    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_values(
                cur,
                """
                INSERT INTO skill_trends (skill, trend_score, latest_count, collected_date)
                VALUES %s
                ON CONFLICT (skill, collected_date)
                DO UPDATE SET
                  trend_score = EXCLUDED.trend_score,
                  latest_count = EXCLUDED.latest_count;
                """,
                [
                    (row["skill"], row["trend_score"], row["latest_count"], today)
                    for _, row in trend_df.iterrows()
                ],
            )
            conn.commit()

    print(f"✅ {len(trend_df)}件のスキルトレンドを登録しました。")

    # === AIコメント生成 ===
    client = get_openai_client()
    summary = None
    if client:
        prompt = f"""
あなたはIT業界の採用・技術動向を分析する専門アナリストです。
以下は最新のスキルトレンドデータです。

各スキルには「trend_score（需要変化率）」と「latest_count（最新の求人件数）」があります。
trend_scoreが高いほど需要が上昇傾向にあり、低いほど減少しています。
採用担当者・エンジニア双方に向けた提案を日本語で出力してください。

出力フォーマット：
- 総評: ...
- 提案: ...

データ:
{trend_df.head(20).to_string(index=False)}
"""
        try:
            comment = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
            )
            summary = comment.choices[0].message.content.strip()
        except Exception as e:
            print(f"AIコメント生成失敗: {e}")

    if not summary:
        top_skills = ", ".join(trend_df.head(5)["skill"].tolist())
        summary = (
            f"- 総評: 直近の需要スコア上位スキルとして【{top_skills}】が台頭しています。\n"
            f"- 提案: クラウド・モダン言語スキルの習得や採用強化が推奨されます。"
        )

    # === trend_score_summary に登録 ===
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO trend_score_summary (date, summary, model_version)
                VALUES (%s, %s, %s)
                """,
                (datetime.now().date().isoformat(), summary, "gpt-4o-mini"),
            )
            conn.commit()

    print("✅ trend_score_summary にコメントを登録しました。")

if __name__ == "__main__":
    main()
