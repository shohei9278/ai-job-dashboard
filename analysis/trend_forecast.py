from prophet import Prophet
import pandas as pd
from supabase import create_client, Client
from datetime import datetime,date, timedelta
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
import numpy as np
#]Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-12-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)
today = date.today()
target_days_ago = today - timedelta(days=20)
seven_days_ago = today - timedelta(days=7)

#Supabaseから求人件数を取得
data = supabase.table("prefecture_job_counts").select("collected_date, job_count").gte("collected_date", target_days_ago.isoformat()).lte("collected_date", today.isoformat()).execute()

if not data.data:
    print("Supabaseからデータが取得できませんでした。")
    exit()

df = pd.DataFrame(data.data)

df["collected_date"] = pd.to_datetime(df["collected_date"])
df = df.groupby("collected_date").sum(numeric_only=True).reset_index()
seven_days_ago = pd.Timestamp.now().normalize() - pd.Timedelta(days=6)
today = pd.Timestamp.now().normalize()
all_dates = pd.date_range(start=seven_days_ago, end=today, freq="D")
df = pd.merge(
    pd.DataFrame({"collected_date": all_dates}),
    df,
    on="collected_date",
    how="left"
).fillna(0)

df_seven_days_ago = df
print(df_seven_days_ago)
df.columns = ["ds", "y"]

print("学習データ:", df.tail())

#Prophetモデルで予測
model = Prophet()
model.fit(df)

future = model.make_future_dataframe(periods=14)
forecast = model.predict(future)

forecast["yhat"] = np.maximum(forecast["yhat"], 0)
forecast["yhat_lower"] = np.maximum(forecast["yhat_lower"], 0)
forecast["yhat_upper"] = np.maximum(forecast["yhat_upper"], 0)

forecast_df = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(14)

print("予測結果:\n", forecast_df)

#Supabaseに保存
rows = [
    {
        "date": row["ds"].date().isoformat(),
        "predicted_count": int(row["yhat"]),
        "lower_bound": int(row["yhat_lower"]),
        "upper_bound": int(row["yhat_upper"]),
    }
    for _, row in forecast_df.iterrows()
]

# 既存データをクリア
supabase.table("job_trend_forecast").delete().neq("id", 0).execute()
supabase.table("job_trend_forecast").insert(rows).execute()

print(f"{len(rows)}件の予測データを保存しました。")

#]AIコメント生成
prompt = f"""
あなたはIT業界の採用・技術動向を分析する専門アナリストです。
以下の求人件数予測データをもとに、
7日先までのITエンジニア市場の「変化」と「推奨アクション」を分かりやすく説明してください。

出力フォーマット：
- トレンド分析: （増加 or 減少などの傾向を具体的に）
- 市場の解釈: （その背景を簡潔に）
- 提案: （企業 / エンジニアに対して具体的な行動提案を出す）

条件：
- 一般読者にも理解できるよう平易な日本語で説明してください。
- データの変化率や上下動を根拠として引用しても構いません。
- できるだけ客観的かつ簡潔にまとめてください。

データ:
{rows}
"""

try:
    comment = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    summary = comment.choices[0].message.content.strip()
except Exception as e:
    summary = f"AIコメント生成失敗: {e}"

#job_insights に記録
supabase.table("job_insights").insert({
    "date": datetime.now().date().isoformat(),
    "summary": summary,
    "model_version": "gpt-4o-mini"
}).execute()

print("AIコメント:", summary)

#]AIコメント生成
prompt = f"""
あなたはIT業界の採用・技術動向を分析する専門アナリストです。
以下の求人件数データ（過去数日間）をもとに、ITエンジニア市場の「現状」と「推奨アクション」を簡潔にまとめてください。

出力フォーマット：
- 求人数の推移: （増加 or 減少を明示）
- 市場の解釈: （どのような要因で変化しているか、簡潔に）
- 提案: （企業 / エンジニアに向けた行動の提案）

条件：
- 一般読者にも分かりやすく、専門用語を避けて説明してください。
- データの変化率や傾向を根拠として述べてください。
- 客観的かつ簡潔にまとめてください。

データ:
{df_seven_days_ago}
"""

try:
    comment = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    summary = comment.choices[0].message.content.strip()
except Exception as e:
    summary = f"AIコメント生成失敗: {e}"

#job_insights に記録
supabase.table("job_count_summary").insert({
    "date": datetime.now().date().isoformat(),
    "summary": summary,
    "model_version": "gpt-4o-mini"
}).execute()
print("AIコメント:", summary)