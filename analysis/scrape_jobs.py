try:
    from serpapi.google_search import GoogleSearch
except ImportError:
    try:
        from serpapi import Client as GoogleSearch
    except ImportError:
        GoogleSearch = None

from openai import AzureOpenAI
import csv
import re
import os
from dotenv import load_dotenv
import time
import pandas as pd
import psycopg2
from datetime import date, timedelta
import json
import random
import sys
from urllib.parse import urlparse

# ======================
# 環境変数読み込み
# ======================
load_dotenv()

APIKEY = os.getenv("SERPAPI_KEY")
DB_URL = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:example@db:5432/jobs"

# Azure OpenAI
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-12-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)

# PostgreSQL接続関数
def get_connection():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or "postgresql://postgres:example@db:5432/jobs"
    if os.path.exists("/.dockerenv") and "localhost" in url:
        url = url.replace("localhost", "db")
    return psycopg2.connect(url)


# ======================
# 定義データ
# ======================
PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

KEYWORDS = [
    "エンジニア",
    "開発",
    "プログラマー",
    "システム",
    "Web",
    "インフラ",
    "ネットワーク"
]

# ======================
# 正規化関数
# ======================
def normalize_prefecture(location: str) -> str:
    for pref in PREFECTURES:
        if pref in location:
            return pref
    return location or ""


def normalize_salary(salary_str):
    if not isinstance(salary_str, str) or salary_str.strip() == "":
        return None

    salary_str = salary_str.replace(",", "").replace("　", " ").replace("〜", "～")

    pattern = re.findall(r"(\d+(?:\.\d+)?)(?:万)?(?:円)?", salary_str)
    if not pattern:
        return None

    amounts = []
    for match in re.finditer(r"(\d+(?:\.\d+)?)(万)?(円)?", salary_str):
        value = float(match.group(1))
        if match.group(2):
            value *= 10000
        amounts.append(int(value))

    if not amounts:
        return None

    avg = sum(amounts) / len(amounts)

    if "時給" in salary_str or "時" in salary_str:
        annual = avg * 8 * 20 * 12
    elif "月給" in salary_str or "月収" in salary_str or "月" in salary_str:
        annual = avg * 12
    elif "年" in salary_str:
        annual = avg
    else:
        if "万" in salary_str:
            annual = avg * 12
        else:
            annual = avg

    return int(annual)


# ======================
# DB操作関数
# ======================
def insert_job_count(pref: str, count: int, collected_date: str):
    """都道府県別の件数をUPSERT"""
    sql = """
        INSERT INTO prefecture_job_counts (collected_date, prefecture, job_count)
        VALUES (%s, %s, %s)
        ON CONFLICT (collected_date, prefecture)
        DO UPDATE SET job_count = EXCLUDED.job_count;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (collected_date, pref, count))
            conn.commit()
    print(f"{pref}: {count} 件 登録完了。")


def insert_job_to_db(job):
    """jobsテーブルへのINSERT（URL重複スキップ＋結果表示）"""
    sql = """
        INSERT INTO jobs (title, company, location, salary, url, summary, skills, collected_date, via)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (url) DO NOTHING
        RETURNING id;
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                job["title"], job["company"], job["location"],
                job["salary"], job["url"], job["summary"],
                job["skills"], job["collected_date"], job["via"]
            ))
            inserted = cur.fetchone()
            conn.commit()

            if inserted:  # RETURNING id が返れば新規登録成功
                print(f"新規登録: {job['title']}")
            else:
                print(f"既に登録済み: {job['url']}")
    


# ======================
# AIによる要約・スキル抽出
# ======================
def sanitize_job(job):
    prompt = f"""
以下は求人情報です。内容を基に、短く要約し、必要なスキルを#タグ形式で抽出してください。
必ず **以下のJSON形式で出力** してください。
---
タイトル: {job['title']}
会社: {job['company']}
勤務地: {job['location']}
年収: {job['salary']}
本文: {job['description']}
---
出力形式:
{{
  "要約": "...",
  "スキル": "#Python #AWS #React",
  "要約タイトル": "...",
  "勤務地": "..."
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは求人情報を要約・分析するアシスタントです。"},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    data = json.loads(response.choices[0].message.content.strip())
    summary = data["要約"]
    skills = data["スキル"].strip().replace("\n", " ").replace("　", " ")
    summary_title = data["要約タイトル"].strip()
    location = data["勤務地"].strip()

    if skills.lower() in ["", "なし", "nan"]:
        skills_array = "{}"
    else:
        skill_list = [s.replace("#", "").strip() for s in skills.split(" ") if s.strip()]
        skills_array = "{" + ",".join([f'"{s}"' for s in skill_list]) + "}"

    return {
        "title": summary_title,
        "company": job["company"],
        "collected_date": job["collected_date"],
        "location": location,
        "salary": normalize_salary(job["salary"]),
        "summary": summary,
        "skills": skills_array,
        "url": job["url"],
        "via": job["via"]
    }


# ======================
# メイン処理
# ======================
# SerpAPI は「検索結果が0件」も error で返すので、失敗と区別する
SERPAPI_NO_RESULTS = "hasn't returned any results"


def raise_on_serpapi_error(results):
    error = results.get("error")
    if error and SERPAPI_NO_RESULTS not in error:
        raise RuntimeError(f"SerpAPI エラー: {error}")


def get_job_count_for_pref(keyword: str, max_pages=5):
    total_count = 0
    today = date.today().isoformat()

    params = {
        "engine": "google_jobs",
        "q": f"{keyword} -(営業 OR 事務 OR 接客)",
        "hl": "ja",
        "gl": "jp",
        "location": "Japan",
        "google_domain": "google.co.jp",
        "api_key": APIKEY,
    }

    page = 0
    while page < max_pages:
        search = GoogleSearch(params)
        results = search.get_dict()
        raise_on_serpapi_error(results)
        jobs_total = results.get("jobs_results", [])

        if not jobs_total:
            print("結果なし。終了。")
            break

        for job in jobs_total:
            title = job.get("title", "")
            company = job.get("company_name", "")
            location = normalize_prefecture(job.get("location", ""))
            description = job.get("description", "")
            via = job.get("via", "")
            url = job.get("apply_options", [{}])[0].get("link", job.get("share_link"))
            salary = ""

            for h in job.get("job_highlights", []):
                if "給与" in h.get("title", "") or "年収" in h.get("title", ""):
                    salary = ", ".join(h.get("items", []))

            job_dict = {
                "title": title,
                "company": company,
                "location": location,
                "salary": salary or "情報なし",
                "url": url,
                "description": description[:500],
                "collected_date": today,
                "via": via
            }

            sanitized = sanitize_job(job_dict)
            insert_job_to_db(sanitized)
            total_count += 1
            time.sleep(1.5)

        page += 1

    print(f"{keyword}: 合計 {total_count} 件取得完了。")


def main():
    failed_keywords = []
    for keyword in KEYWORDS:
        try:
            get_job_count_for_pref(keyword)
        except Exception as e:
            print(f"{keyword} でエラー: {e}")
            failed_keywords.append(keyword)
            time.sleep(3)

    if failed_keywords:
        print(f"収集に失敗したキーワード: {', '.join(failed_keywords)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
