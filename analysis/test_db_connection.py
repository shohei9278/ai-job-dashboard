import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DB_URL")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM jobs;")
    count = cur.fetchone()[0]
    print(f"✅ 接続成功！jobs テーブルの件数: {count}件")
except Exception as e:
    print("❌ 接続エラー:", e)
finally:
    if 'conn' in locals():
        conn.close()
