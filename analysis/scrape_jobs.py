from serpapi.google_search import GoogleSearch
from openai import AzureOpenAI
import csv
import re
import os
from dotenv import load_dotenv
import time
import pandas as pd
from supabase import create_client, Client
from datetime import date, timedelta
import json
import random
from urllib.parse import urlparse

load_dotenv()
APIKEY = os.getenv("SERPAPI_KEY")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-12-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)
# Supabase クライアント
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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


def normalize_prefecture(location: str) -> str:
    for pref in PREFECTURES:
        if pref in location:
            return pref
    return location  # 見つからなければそのまま返す


def normalize_salary(salary_str):
    if not isinstance(salary_str, str) or salary_str.strip() == "":
        return None

    salary_str = salary_str.replace(",", "").replace("　", " ").replace("〜", "～")

    # 「○万△円」パターンを全部抽出
    pattern = re.findall(r"(\d+(?:\.\d+)?)(?:万)?(?:円)?", salary_str)
    if not pattern:
        return None

    # 単位別に変換
    amounts = []
    for match in re.finditer(r"(\d+(?:\.\d+)?)(万)?(円)?", salary_str):
        value = float(match.group(1))
        if match.group(2):  # 「万」が付く場合
            value *= 10000
        amounts.append(int(value))

    if not amounts:
        return None

    # 範囲指定の場合は中間値を取る
    avg = sum(amounts) / len(amounts)

    # 時給・月給・年収などを検出して年収換算
    if "時給" in salary_str or "時" in salary_str:
        annual = avg * 8 * 20 * 12  # 8h×20日×12ヶ月
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

def insert_job_count(pref: str, count: int,collected_date:str):
    """Supabaseへ登録（重複スキップ）"""
    today = date.today().isoformat()

    # existing = supabase.table("prefecture_job_counts") \
    #     .select("*") \
    #     .eq("collected_date", collected_date) \
    #     .eq("prefecture", pref) \
    #     .execute()

    # if existing.data:
    #     print(f"{pref} は既に登録済み。スキップ。")
    #     return

    try:
        supabase.table("prefecture_job_counts").upsert({
            "collected_date": collected_date,
            "prefecture": pref,
            "job_count": count
        },on_conflict="collected_date,prefecture" ).execute()
        print(f"{pref}: {count} 件 登録完了。")
    except Exception as e:
        print("Supabase Error:", e)


    

def sanitize_job(job):
    # AI要約（本文を短縮し、企業名・固有名詞を除去）
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

出力形式は次のようにしてください：

{{
  "要約":求人内容を個人名や社名を除外して100字以内で要約してください。
"スキル": #Python #AWS #React のように出力
"要約タイトル":要約した内容でタイトルを作成してください。（個人名や社名は除外）
"勤務地":勤務地が47都道府県のいずれかになっていない場合、47都道府県のいずれかに分類してください。不明な場合は空にしてください。日本もNG
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
    

    data = json.loads( response.choices[0].message.content.strip())



    summary = data["要約"]
    skills =data["スキル"].strip().replace("\n", " ").replace("　", " ")
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

def get_job_count_for_pref(keyword:str,max_pages=10):
    total_count = 0
    page = 0
    next_token = None
    jobs = []

    today = date.today().isoformat()

    # today = date.today()
    # seven_days_ago = today - timedelta(days=8)
    # today = seven_days_ago.isoformat(
    

    params = {
            "engine": "google_jobs",
            "q": f"{keyword} -(営業 OR 事務 OR 接客)",
            "hl": "ja",
            "gl": "jp",
             "location": "Japan",
            "google_domain": "google.co.jp",
            "api_key": APIKEY,
    }


        
    while page < max_pages:
        
    
        search = GoogleSearch(params)
        results = search.get_dict()
        jobs_total = results.get("jobs_results", [])  
        
        if not jobs_total:
            if page > 0:
                print("トークン再試行中")
                time.sleep(1)
                retry = GoogleSearch(params).get_dict().get("jobs_results", [])
                if not retry:
                    print("次ページが空な為、処理終了")
                    break
                jobs_total = retry.get("jobs_results", [])
                
            break
        time.sleep(2)


        for job in results.get("jobs_results", []):
            
            title = job.get("title", "")
            via = job.get("via", "")
            company = job.get("company_name", "")
            location = job.get("location", "")
    
            url = job.get("apply_options", [{}])[0].get("link", job.get("share_link"))

            xisting = supabase.table("jobs").select("id").eq("url", url).execute()
            
            if xisting.data:
                print(f"{url}:登録済")
                continue

            total_count += 1
           

            description = job.get("description", "")

            #job_highlights 内から給与を抽出
            salary = ""
            for h in job.get("job_highlights", []):
                if "給与" in h.get("title", "") or "年収" in h.get("title", ""):
                    salary = ", ".join(h.get("items", []))

            #detected_extensions に salary 情報がある場合
            if not salary and "detected_extensions" in job:
                det = job["detected_extensions"]
                if "salary" in det:
                    salary = det["salary"]

            #description に「年収」や「月給」などの直接表記がある場合
            if not salary:
                match = re.search(r"(年収|月給|時給)[0-9０-９,万~〜]+", description)
                if match:
                    salary = match.group(0)

                

            job_dict ={
                "title": title,
                "company": company,
                "location": normalize_prefecture(location),
                "salary": salary or "情報なし",
                "url": url,
                "description": description[:500],
                "collected_date":today,
                "via":via
            }

            sanitize_job_data = sanitize_job(job_dict)
            
            jobs.append(sanitize_job_data)

            res = supabase.table("jobs").insert(sanitize_job_data).execute()
            
            if res.data:
                print(f"{sanitize_job_data['title']}: 登録完了")
            else:
                print(f"{sanitize_job_data['title']}: 登録失敗 - {res}")
    
       

        # ページネーション対応
        pagination = results.get("serpapi_pagination", {})
        next_page_token = pagination.get("next_page_token")
        if not next_page_token:
            break  # 次ページがない場合終了

        page += 1
        params["next_page_token"] = next_page_token
        time.sleep(0.5) 

    return jobs
    
    
   


            


#
if __name__ == "__main__":

    jobs = []

    

    # ダミーデータ挿入
    # for i in range(1,30):
    #     for pref in PREFECTURES:
    #         today = date.today()
    #         seven_days_ago = today - timedelta(days=i)
    #         print(seven_days_ago)
    #         today = seven_days_ago.isoformat()
    #         num = random.randint(1, 5)
    #         insert_job_count(pref,num,today)

   


    for keyword in KEYWORDS:
        try:
            get_job_count_for_pref(keyword)
            
        except Exception as e:
            print(f"{keyword} でエラー: {e}")
            time.sleep(5)


    today = date.today().isoformat()

    response = (
    supabase.table("jobs")
    .select("*")
    .eq("collected_date", today)
    .execute()
)        

    if response.data:
        df = pd.DataFrame(response.data)
        counts_df = df.groupby("location").size().reset_index(name="count")
        print(counts_df)
        for _, row in counts_df.iterrows():
                
                try:
                    insert_job_count(row["location"],row["count"],today)
                    time.sleep(3)
                except Exception as e:
                    print(f"{row['location']} でエラー: {e}")
                    time.sleep(5)
            
   



  