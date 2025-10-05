import os
from dotenv import load_dotenv
from pathlib import Path

# 現在のディレクトリ基準で .env をロード
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def check_env():
    print("環境変数ロード確認")
    print("SUPABASE_URL:", SUPABASE_URL[:40] + "..." if SUPABASE_URL else "None")
    print("OPENAI_API_KEY:", "Loaded" if OPENAI_API_KEY else "None")
    print("SERPAPI_KEY:", "Loaded" if SERPAPI_KEY else "None")

if __name__ == "__main__":
    check_env()