import requests
import datetime

# NestJSサーバー
WEBHOOK_URL = "https://ai-job-dashboard-ztxo.onrender.com/webhook/update"

payload = {
    "type": "data_update",
    "timestamp": datetime.datetime.now().isoformat(),
    "message": "データ取得、更新が完了しました。",
    "source": "python-analysis"
}

try:
    res = requests.post(WEBHOOK_URL, json=payload)
    if res.status_code in (200, 201):
        print("Webhook送信成功:", res.json())
    else:
        print("Webhook送信失敗:", res.status_code, res.text)
except Exception as e:
    print("Webhook送信エラー:", e)