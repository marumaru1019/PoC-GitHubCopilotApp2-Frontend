# GitHub Copilot ハンズオン - 環境構築ガイド

本ガイドは、GitHub Copilot ハンズオンワークショップに参加される方向けの事前準備手順書です。
ハンズオン当日までに、以下の手順に従って環境構築を完了させてください。

## 📋 目次

1. [必要な環境・ソフトウェア](#必要な環境ソフトウェア)
2. [アプリケーション概要](#アプリケーション概要)
3. [環境構築手順](#環境構築手順)
   - [バックエンド (Python/FastAPI)](#バックエンド-pythonfastapi)
   - [フロントエンド (Next.js/React)](#フロントエンド-nextjsreact)
4. [動作確認](#動作確認)
5. [トラブルシューティング](#トラブルシューティング)

---

## 必要な環境・ソフトウェア

### 必須ソフトウェア

事前に以下のソフトウェアをインストールしてください:

| ソフトウェア | バージョン | 用途 | ダウンロード先 |
|------------|-----------|------|--------------|
| **Visual Studio Code** | 最新版 | 開発エディタ | [https://code.visualstudio.com/](https://code.visualstudio.com/) |
| **GitHub Copilot 拡張機能** | 最新版 | AI コーディング支援 | VS Code の拡張機能から「GitHub Copilot」を検索してインストール |
| **Git** | 2.0 以上 | バージョン管理 | [https://git-scm.com/](https://git-scm.com/) |
| **Python** | 3.11 以上 | バックエンド実行環境 | [https://www.python.org/](https://www.python.org/) |
| **Node.js** | 20.x 以上 | フロントエンド実行環境 | [https://nodejs.org/](https://nodejs.org/) |
| **npm** | 10.x 以上 | パッケージマネージャ | Node.js に同梱 |

### オプション (Docker を使用する場合)

| ソフトウェア | バージョン | 用途 | ダウンロード先 |
|------------|-----------|------|--------------|
| **Docker Desktop** | 最新版 | コンテナ実行環境 | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |

> **注意**: Mac M1/M2 をご使用の場合は、Docker の設定で `platform: linux/amd64` を有効にする必要があります(手順内で説明します)。

### バージョン確認方法

ターミナル(macOS/Linux)またはコマンドプロンプト(Windows)で以下のコマンドを実行して、各ソフトウェアが正しくインストールされているか確認してください:

```bash
# Git のバージョン確認
git --version

# Python のバージョン確認
python --version
# または
python3 --version

# Node.js のバージョン確認
node --version

# npm のバージョン確認
npm --version

# Docker のバージョン確認 (Docker を使用する場合)
docker --version
docker-compose --version
```

**期待される出力例:**
```
git version 2.39.0
Python 3.11.5
v22.21.1
10.5.0
Docker version 24.0.0, build abc1234
docker-compose version 1.29.2, build 5becea4c
```

---

## アプリケーション概要

### 統合ヘルプデスク・ナレッジベースシステム

本アプリケーションは、GitHub Copilot ハンズオン用のサンプルプロジェクトとして開発された、チケット管理とナレッジベースを統合したサポートプラットフォームアプリケーションです。

#### 主な機能

1. **チケット管理システム**
   - サポートチケットの作成・追跡・管理
   - ステータス管理: 新規 → 対応中 → 顧客待ち → 解決済み → 完了
   - 優先度設定: 低・中・高・緊急
   - コメント機能(公開・内部メモ)

2. **ナレッジベース**
   - Markdown 対応の記事作成・公開
   - カテゴリ・タグによる分類
   - 検索・フィルタリング機能
   - 閲覧数トラッキング

3. **ロールベースアクセス制御**
   - **管理者**: システム全体の管理権限
   - **オペレーター**: チケット対応、記事作成
   - **利用者**: チケット作成、記事閲覧

#### テストアカウント

環境構築後、以下のアカウントでログインできます:

| 役割 | メールアドレス | パスワード |
|-----|--------------|-----------|
| 管理者 | admin@example.com | testpass123 |
| オペレーター | operator@example.com | testpass123 |
| 利用者 | user@example.com | testpass123 |

#### アーキテクチャ

```
┌─────────────────┐      HTTP API (Port 3000)      ┌──────────────────┐
│   Frontend      │ ────────────────────────────→ │    Backend       │
│   (Next.js)     │ ←──────────────────────────── │   (FastAPI)      │
│   Port: 3000    │      JSON Response             │   Port: 8000     │
└─────────────────┘                                └──────────────────┘
                                                            │
                                                            ↓
                                                    ┌──────────────────┐
                                                    │   SQLite DB      │
                                                    │  (helpdesk.db)   │
                                                    └──────────────────┘
```

---

## 環境構築手順

### バックエンド (Python/FastAPI)

バックエンドは **ローカル環境** または **Docker** のどちらかで構築できます。
どちらか一方を選択して実施してください。

#### 方法1: ローカル環境でのセットアップ (推奨)

##### 1. リポジトリのクローン

```bash
git clone https://github.com/marumaru1019/PoC-GitHubCopilotApp2-Backend.git
cd PoC-GitHubCopilotApp2-Backend
```

##### 2. 環境変数ファイルの作成

```bash
cp .env.example .env
```

##### 3. Python 仮想環境の作成と有効化

**macOS / Linux の場合:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows の場合:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

> プロンプトの先頭に `(.venv)` と表示されれば、仮想環境が有効化されています。

##### 4. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

**期待される出力:**
```
Successfully installed fastapi-0.115.0 uvicorn-0.30.1 sqlalchemy-2.0.35 ...
```

##### 5. データベースのマイグレーション実行

```bash
alembic upgrade head
```

**期待される出力:**
```
INFO  [alembic.runtime.migration] Running upgrade  -> a6a51f800395, initial migration
```

##### 6. 初期データの投入

```bash
python seed.py
```

**期待される出力:**
```
Seeding database...
Created users, teams, categories, tags, and SLA settings successfully!
```

##### 7. バックエンドサーバーの起動

```bash
python -m uvicorn app.main:app --reload
```

**期待される出力:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

##### 8. API ドキュメントの確認

ブラウザで以下の URL にアクセスして、Swagger UI が表示されることを確認してください:

```
http://localhost:8000/docs
```

##### 9. ログイン API のテスト

Swagger UI 上で以下の手順を実施:

1. `POST /api/auth/login` エンドポイントを展開
2. 「Try it out」ボタンをクリック
3. Request body に以下を入力:
   ```json
   {
     "email": "admin@example.com",
     "password": "testpass123"
   }
   ```
4. 「Execute」ボタンをクリック

**期待される結果:**
- **Response code**: `200`
- **Response body**: `access_token` が含まれる JSON

✅ ステータスコード 200 が返ってきたら成功です!

> **重要**: フロントエンドのセットアップで使用するため、バックエンドサーバーは **起動したまま** にしておいてください。

---

#### 方法2: Docker でのセットアップ

##### 1. リポジトリのクローン

```bash
git clone https://github.com/marumaru1019/PoC-GitHubCopilotApp2-Backend.git
cd PoC-GitHubCopilotApp2-Backend
```

##### 2. 環境変数ファイルの作成

```bash
cp .env.example .env
```

##### 3. Docker Compose ファイルの編集 (Mac M1/M2 ユーザーのみ)

Mac M1/M2 チップをご使用の場合は、`docker-compose.yml` を編集します:

```bash
# エディタで docker-compose.yml を開く
code docker-compose.yml
```

以下の行のコメントアウトを **解除** してください:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    platform: linux/amd64  # ← この行のコメントアウトを外す
```

##### 4. Docker コンテナのビルドと起動

```bash
docker-compose up --build
```

**期待される出力:**
```
Creating network "poc-githubcopilotapp2-backend_helpdesk-network" with driver "bridge"
Building backend
...
Successfully built abc123def456
Successfully tagged poc-githubcopilotapp2-backend_backend:latest
Creating helpdesk-backend ... done
Attaching to helpdesk-backend
helpdesk-backend | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

##### 5. データベースのマイグレーション実行

**新しいターミナルウィンドウを開いて**、以下のコマンドを実行:

```bash
cd PoC-GitHubCopilotApp2-Backend
docker-compose exec backend alembic upgrade head
```

##### 6. 初期データの投入

```bash
docker-compose exec backend python seed.py
```

##### 7. API ドキュメントの確認

ブラウザで以下の URL にアクセス:

```
http://localhost:8000/docs
```

##### 8. ログイン API のテスト

ローカル環境のセットアップの「9. ログイン API のテスト」と同じ手順で実施してください。

✅ ステータスコード 200 が返ってきたら成功です!

> **重要**: Docker コンテナは **起動したまま** にしておいてください。

---

### フロントエンド (Next.js/React)

バックエンドが起動していることを確認してから、フロントエンドのセットアップを開始してください。

##### 1. リポジトリのクローン

**新しいターミナルウィンドウを開いて**、以下のコマンドを実行:

```bash
git clone https://github.com/marumaru1019/PoC-GitHubCopilotApp2-Frontend.git
cd PoC-GitHubCopilotApp2-Frontend
```

##### 2. 依存パッケージのインストール

```bash
npm install
```

**期待される出力:**
```
added 500 packages, and audited 501 packages in 30s
found 0 vulnerabilities
```

> インストールには数分かかる場合があります。

##### 3. 開発サーバーの起動

```bash
npm run dev
```

**期待される出力:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Network:      http://192.168.1.10:3000

✓ Starting...
✓ Ready in 2.5s
```

##### 4. ブラウザでアクセス

ブラウザで以下の URL にアクセス:

```
http://localhost:3000
```

ログイン画面が表示されることを確認してください。

##### 5. ログインテスト

以下の情報でログインを試してください:

- **メールアドレス**: `admin@example.com`
- **パスワード**: `testpass123`

✅ ログイン後、ダッシュボード画面が表示されたら成功です!

##### 6. 単体テストの実行

**新しいターミナルウィンドウを開いて**、以下のコマンドを実行:

```bash
cd PoC-GitHubCopilotApp2-Frontend
npm run test
```

**期待される出力例:**
```
✓ app/tickets/[id]/__tests__/page.test.tsx (2)
✓ app/tickets/new/__tests__/page.test.tsx (3)

Test Files  2 passed (2)
     Tests  5 passed (5)
```

> テストの成功・失敗に関わらず、実行できれば問題ありません。

##### 7. Playwright のインストール

E2E テストを実行するために、Playwright ブラウザをインストールします:

```bash
npx playwright install
```

**期待される出力:**
```
Downloading Chromium 123.0.6312.4 (playwright build v1234)
...
✔ Success! Playwright browsers are installed.
```

##### 8. E2E テストの実行

```bash
npm run test:e2e
```

**期待される出力例:**
```
Running 5 tests using 1 worker
  ✓  [chromium] › e2e/ticket-flow.spec.ts:3:5 › Ticket workflow › should create a new ticket (5s)
  ...

  5 passed (30s)
```

> テストの成功・失敗に関わらず、実行できれば問題ありません。

---

## 動作確認

すべてのセットアップが完了したら、以下の動作確認を実施してください。

### ✅ チェックリスト

- [ ] バックエンドが `http://localhost:8000` で起動している
- [ ] バックエンドの API ドキュメント (`http://localhost:8000/docs`) にアクセスできる
- [ ] ログイン API でステータスコード 200 が返ってくる
- [ ] フロントエンドが `http://localhost:3000` で起動している
- [ ] ブラウザでログイン画面が表示される
- [ ] テストアカウント (`admin@example.com` / `testpass123`) でログインできる
- [ ] 単体テスト (`npm run test`) が実行できる
- [ ] E2E テスト (`npm run test:e2e`) が実行できる

---

## 🎉 環境構築完了!

すべての手順が完了したら、環境構築は完了です。

---

## リンク

- [GitHub Copilot 公式ドキュメント](https://docs.github.com/en/copilot)
- [FastAPI 公式ドキュメント](https://fastapi.tiangolo.com/)
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [本プロジェクトのバックエンドリポジトリ](https://github.com/marumaru1019/PoC-GitHubCopilotApp2-Backend)
- [本プロジェクトのフロントエンドリポジトリ](https://github.com/marumaru1019/PoC-GitHubCopilotApp2-Frontend)

---