import pandas as pd
from supabase import create_client, Client
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# データ取得 
response = supabase.table("jobs").select("id, collected_date, skills").execute()
df = pd.DataFrame(response.data)

# 前処理 
df["collected_date"] = pd.to_datetime(df["collected_date"], errors="coerce")
df = df.dropna(subset=["skills", "collected_date"])
df = df.explode("skills").reset_index(drop=True)
df["skills"] = df["skills"].str.strip().str.lower()

# スキル×日次で件数集計 
trend = (
    df.groupby(["collected_date", "skills"])
      .agg(count=("id", "count"))
      .reset_index()
)

# 成長スコア算出（線形回帰の傾き） 
slopes = []
for skill in trend["skills"].unique():
    sub = trend[trend["skills"] == skill].copy()
    if len(sub) >= 5:  # 最低5日分以上あるスキルのみ
        sub = sub.sort_values("collected_date")
        X = np.arange(len(sub)).reshape(-1, 1)
        y = sub["count"].values
        model = LinearRegression().fit(X, y)
        slope = model.coef_[0]
        slopes.append({
            "skill": skill,
            "trend_score": round(float(slope), 4),
            "latest_count": int(sub["count"].iloc[-1]),
        })

if slopes:
    trend_df = pd.DataFrame(slopes).sort_values("trend_score", ascending=False)

    # 出力 
    print(trend_df.head(20))
    for _, row in trend_df.iterrows():
        supabase.table("skill_trends").upsert({
            "skill": row["skill"],
            "trend_score": row["trend_score"],
            "latest_count": row["latest_count"],
            "collected_date": pd.Timestamp.today().date().isoformat()
        }, on_conflict=["skill", "collected_date"]).execute()

