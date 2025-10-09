# AI求人ダッシュボード

**バージョン：v1.0.0（初期公開版）**  
※ 一部機能はデモ目的で静的データを使用している部分があります。  
→ 常時更新や異常検知機能は今後対応予定。

**デモサイト**  
- フロントエンド: [https://ai-job-dashboard-frontend.vercel.app](https://ai-job-dashboard-plum.vercel.app/)  
- バックエンドAPI: [https://ai-job-dashboard-backend.onrender.com/jobs](https://ai-job-dashboard-ztxo.onrender.com/)  

---

## システム構成図


```mermaid
graph TD
G["GitHub Actions<br/>(定期実行)"]
    --> A["Python<br/>(スクレイピング・機械学習・AI要約)"]
  A -->|データ挿入| B["Supabase<br/>(PostgreSQL)"]
  B -->|クエリ| C["Backend<br/>(Express + Render)"]
  C -->|APIレスポンス| D["Frontend<br/>(React + Vercel)"]

```

---

## プロジェクト概要

このアプリケーションは「求人情報 × AI分析」をテーマにしたデータ分析ダッシュボードです。  
Pythonで求人情報をスクレイピングし、Supabaseに格納。  
機械学習を活用して求人データの傾向を分析し、
OpenAI APIで要約・スキル抽出を行い、Reactで構築したダッシュボード上に可視化します。

| 機能 | 概要 |
|------|------|
| 求人スクレイピング | PythonでIndeedやGreenなどから求人情報を自動収集 |
| AI要約・スキル抽出 | Azure  OpenAI APIを用いて職種情報を自動要約・スキル分類 |
| トレンド分析 | 職種別・スキル別に時系列グラフで傾向を可視化 |
| データベース連携 | Supabaseを使用したデータ永続化とAPI提供 |
| ダッシュボードUI | TailwindCSSとRechartsによるレスポンシブグラフ表示 |

---

## 技術構成

| 分類 | 使用技術 |
|------|-----------|
| フロントエンド | React, TypeScript, Vite, TailwindCSS |
| バックエンド | Node.js (Express), TypeScript, ts-node |
| データベース | Supabase (PostgreSQL) |
| AI / LLM | Azure OpenAI API (GPT-4) |
| データ分析 | Python, BeautifulSoup, pandas |
| デプロイ | Vercel（フロントエンド）, Render（バックエンド） |
| 環境管理 | dotenv, .env, GitHub Actions |

---

## ディレクトリ構成

<pre><code>
ai-job-dashboard/
├── frontend/          # React + Tailwind (UI)
│   ├── src/
│   └── .env
├── backend/           # Express + TypeScript (API)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── jobs.ts
│   │   │   └── trends.ts
│   │   └── db.ts
│   └── .env
└── analysis/          # Pythonスクリプト (データ収集・解析・機械学習)
    ├── scrape_jobs.py
    ├── summarize_jobs.py
    └── trend_score
</code></pre>

---

## コメント

このアプリは「AI × 自動化 × 可視化」をテーマに、
求人情報の収集から分析・可視化までを一貫して自動化することを目的として開発しました。
SupabaseやOpenAIなどの最新ツールを活用し、
フロントエンドからバックエンド、データ分析まで全てをTypeScriptとPythonで構築しています。

---

## 今後のアップデート予定

[ ]異常検知

[ ]Supabaseトリガーによる自動再集計

[ ]PDFまたはCSVへのエクスポート機能

[ ]トレンドグラフの動的フィルタリング（期間・スキル別）

[ ]UIの調整


---

