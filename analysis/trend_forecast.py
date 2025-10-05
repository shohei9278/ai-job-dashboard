from prophet import Prophet
import pandas as pd
from supabase import create_client, Client
from datetime import datetime,date, timedelta
import os
from dotenv import load_dotenv
from openai import AzureOpenAI

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
df_seven_days_ago = df[df["collected_date"].dt.date >= seven_days_ago]
print(df_seven_days_ago)
df.columns = ["ds", "y"]

print("学習データ:", df.tail())

#Prophetモデルで予測
model = Prophet()
model.fit(df)

future = model.make_future_dataframe(periods=14)
forecast = model.predict(future)

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
以下の求人件数予測データをもとに、7日先までのITエンジニア市場の傾向を簡潔に要約してください。
- 増加傾向 / 減少傾向 のどちらかを明示してください。
- 一般読者にも分かりやすく説明してください。

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
以下の求人件数データをもとにITエンジニア市場の傾向を簡潔に要約してください。
- 全体の求人数の推移（増加 or 減少）
- 一般読者にも分かりやすく説明してください。

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