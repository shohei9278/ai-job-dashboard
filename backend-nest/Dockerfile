# ベースイメージ（Node + libc互換）
FROM node:20-alpine AS builder

# Prismaのクエリエンジンをビルドするため、必要なツールを追加
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# パッケージのインストール
COPY package*.json ./
RUN npm ci

# Prismaスキーマを先にコピーして generate（キャッシュ効率化）
COPY prisma ./prisma
RUN npx prisma generate

# 残りのソースコードをコピー
COPY . .

# NestJS をビルド
RUN npm run build

# 本番用ステージ（軽量）
FROM node:20-alpine AS runner
WORKDIR /app

# 依存ライブラリ（production のみ）
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma クライアント + dist をコピー
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/generated /app/generated
COPY --from=builder /app/dist /app/dist
COPY prisma ./prisma

# ポート指定
EXPOSE 8080
ENV NODE_ENV=production
# 起動コマンド
CMD ["npm", "run", "start:prod"]
