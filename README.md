# AI Job Dashboard

AI を活用して求人データを収集・分析し、トレンドを可視化するダッシュボードアプリケーションです。  
バックエンドは NestJS + Prisma、フロントエンドは React + TailwindCSS により構築されています。

---

## 概要

- 求人情報のスクレイピングと自動分析
- 求人数推移・スキルトレンドなどの可視化
- Supabase (PostgreSQL) を利用したデータ管理
- フロントエンドからバックエンドへの API 連携済み
- Render（API）および Vercel（UI）にデプロイ済み

---

## 技術構成

| レイヤー | 使用技術 |
|----------|-----------|
| フロントエンド | React, Vite, TailwindCSS |
| バックエンド | NestJS, TypeScript, Prisma |
| データベース | PostgreSQL（Supabase） |
| デプロイ | Render（バックエンド）, Vercel（フロントエンド） |
| 分析スクリプト | Python（スクレイピング・トレンド分析） |

---

## 公開 URL

- フロントエンド: [https://ai-job-dashboard-plum.vercel.app/](https://ai-job-dashboard-plum.vercel.app/)
- バックエンド API: [https://ai-job-dashboard-ztxo.onrender.com](https://ai-job-dashboard-ztxo.onrender.com)

---

## ディレクトリ構成

```
ai-job-dashboard/
├── frontend/                # React + Tailwind (UI)
│   ├── src/
│   ├── public/
│   └── .env
│
├── backend-nest/            # NestJS + Prisma (API)
│   ├── src/
│   │   ├── prisma/
│   │   ├── jobs/
│   │   ├── trends/
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
│
└── analysis/                # Pythonスクリプト（スクレイピング・分析）
    ├── scrape_jobs.py
    ├── summarize_jobs.py
    └── trend_forecast.py
```

---

## セットアップ手順

### バックエンド（NestJS）

```bash
cd backend-nest
npm install
npx prisma generate
npm run build
npm run start:dev      # 開発モード
# または
npm run start:prod     # 本番モード
```

### フロントエンド（React + Vite）

```bash
cd frontend
npm install
npm run dev
npm run build
```

---

## 環境変数設定

### backend-nest/.env

```
DATABASE_URL="postgresql://postgres:******@db.xxxxxx.supabase.co:5432/postgres?sslmode=require"
PORT=8080
NODE_ENV=production
```

### frontend/.env

```
VITE_API_URL=https://ai-job-dashboard-ztxo.onrender.com
```

---

## API エンドポイント例

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/jobs` | 求人データの取得 |
| GET | `/trends` | 求人トレンドの取得 |
| GET | `/trends/forecast` | 求人件数予測データの取得 |
| GET | `/trends/skill` | スキル別トレンドデータ取得 |

---

## 今後の開発予定

- 認証（ログイン）機能の追加（Supabase Auth）
- 自動スクレイピング＋定期実行（GitHub Actions / Cron）
- 高度な機械学習モデルによるトレンド分析
- UI/UX の改善・ダークモード対応

---

## 作者

中原 翔平  
自作ポートフォリオとして公開中  
GitHub: [https://github.com/shohei9278/ai-job-dashboard](https://github.com/shohei9278/ai-job-dashboard)
