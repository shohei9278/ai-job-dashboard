# ベースイメージ
FROM python:3.11-slim

# システム依存関係を追加（pandas, psycopg2 などが使う）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app

# 依存関係のインストール（キャッシュ最適化）
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# アプリコードをコピー
COPY . .

# エントリーポイント
ENTRYPOINT ["python", "main.py"]
CMD ["scrape"]
