# AI Job Dashboard

**バージョン:** v2.0.0（構造刷新版）
AIと機械学習を活用して、求人データを自動収集・分析・可視化するフルスタックWebアプリケーション。
NestJS + Prisma + Winston + Swagger による堅牢なバックエンド構成へ刷新。

---

## 概要

-   求人情報を自動収集し、AIで要約・スキル抽出\
-   求人数推移・スキルトレンドをグラフ可視化\
-   **スキルマッチ分析 / スキルギャップ分析 / 年収シミュレーション**
    による個人分析機能\
-   Azure OpenAI による「AIコメント（市場分析フィードバック）」生成\
-   Supabase を利用したユーザー管理・画像ストレージ対応\
-   **JWT + Cookie認証 / NestJS + Prisma構成** による堅牢なAPI基盤

---

## 主な機能

  |カテゴリ|機能内容|
  |----------|-----------|
  |求人分析|スキルトレンド・件数推移・地域別分析|
  |個人分析|スキルマッチ率、ギャップ分析、年収シミュレーション|
  |AIコメント|OpenAI（Azure版GPT-4o-mini）による市場価値フィードバック|
  |データ管理|Supabase（PostgreSQL + Storage）を利用した永続化|
  |認証機能|JWT + Cookie ベースのログイン／新規登録|
  |表示最適化| 24時間キャッシュ + 初期ロード改善対応(無料プランの為)|

----

## 技術構成

| レイヤー | 使用技術 |
|----------|-----------|
| フロントエンド | React, Vite, TailwindCSS |
| バックエンド | NestJS, TypeScript, Prisma, Winston, Swagger |
| データベース | PostgreSQL（Supabase） |
| デプロイ | Render（バックエンド）, Vercel（フロントエンド） |
| 分析スクリプト | Python（スクレイピング・トレンド分析） |

---

## 公開 URL

**無料プラン運用のため、アクセス時にサーバーがスリープから復帰する場合があります。**
**初回アクセス時に数十秒ほど時間がかかる場合があります。**

- フロントエンド（Vercel）: [https://ai-job-dashboard-plum.vercel.app/](https://ai-job-dashboard-plum.vercel.app/)
- バックエンド（Render / NestJS API）: [https://ai-job-dashboard-ztxo.onrender.com/](https://ai-job-dashboard-ztxo.onrender.com/)
- APIドキュメント（Swagger UI）: [https://ai-job-dashboard-ztxo.onrender.com/api/docs](https://ai-job-dashboard-ztxo.onrender.com/api/docs)

---

## システム構成図

```mermaid
graph TD
  G["GitHub Actions<br/>(定期実行)"]
    --> A["Python<br/>(スクレイピング・機械学習・AI要約)"]
  A -->|データ挿入| B["Supabase<br/>(PostgreSQL)"]
  B -->|クエリ| C["Backend<br/>(NestJS)"]
  C -->|APIレスポンス| D["Frontend<br/>(React + Vercel)"]
```

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
│   │   ├── common/
│   │   │   └── interceptors/
│   │   │       └── logging.interceptor.ts
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

## ロギング（Winston）

- /backend/src/common/logger/winston-logger.service.ts に定義
- コンソール・ファイル両方へ出力
- フォーマット: JSON / タイムスタンプ / リクエストID対応
例：
```
[INFO] 2025-10-11 18:00:01 - GET /api/jobs - status=200 duration=45ms
[ERROR] 2025-10-11 18:01:22 - PrismaClientError: prepared statement already exists
```

---

## 新機能 (v2.0.0)

- ユーザー登録・ログイン（JWT + Cookie）
- プロフィール画像アップロード（Supabase Storage）
- スキル登録・編集・削除（リアルタイム反映）
- スキルマッチ / ギャップ分析 / 年収シミュレーション
- AIコメント生成機能（Azure OpenAI連携、バックエンド側）
- ログインユーザー向け「マイ分析ページ」

---

## 今後の開発予定

- WebSocketによるリアルタイム求人更新通知
- PDF / CSVレポート自動出力
- MLモデル再学習の自動トリガー
- ユーザー認証（Supabase Auth + JWT）
- MLOps パイプライン整備（GitHub Actions + Python + Supabase）
- LangChain + Supabase Vector Store による過去トレンド参照型AI提案

---

## 作者

中原 翔平  
自作ポートフォリオとして公開中  
GitHub: [https://github.com/shohei9278/ai-job-dashboard](https://github.com/shohei9278/ai-job-dashboard)
