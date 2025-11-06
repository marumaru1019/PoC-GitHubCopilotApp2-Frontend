# Helpdesk Frontend

統合ヘルプデスク＆ナレッジベースシステムのフロントエンドアプリケーションです。

## アプリの概要

このアプリケーションは、企業内のサポート業務を効率化するための統合プラットフォームです：

- **チケット管理**: 問い合わせチケットの作成・編集・ステータス管理・コメント機能
- **ナレッジベース**: よくある質問や技術文書の作成・検索・公開管理
- **管理機能**: ユーザー・チーム・カテゴリ・タグ・SLA設定・監査ログの管理

### 主な機能

- 📝 **チケット管理** - 問い合わせの追跡と対応
- 📚 **ナレッジベース** - 記事の作成と検索
- 👥 **ロールベースアクセス** - Admin / Operator / Requester の3つのロール
- 🔍 **高度な検索** - チケットと記事の絞り込み検索
- 📊 **SLA管理** - 優先度別の対応時間設定
- 🔐 **JWT認証** - セキュアなログイン・ログアウト

## 技術スタック

### コアフレームワーク
- **Next.js**: 15.5.6 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.x

### 状態管理・データフェッチング
- **TanStack Query**: 5.90.6 (React Query)
- **Axios**: 1.13.2
- **React Hook Form**: 7.66.0 + Zod 4.1.12

### UIコンポーネント
- **Radix UI**: Accessible なプリミティブコンポーネント
- **shadcn/ui**: Tailwind ベースのUIコンポーネント
- **Lucide React**: アイコンライブラリ

### テスティング
- **Vitest**: 4.0.7 (単体テスト)
- **React Testing Library**: 16.3.0
- **MSW**: 2.12.0 (Mock Service Worker)
- **Playwright**: 1.56.1 (E2Eテスト)
- **@vitest/coverage-v8**: カバレッジレポート

### その他
- **React Markdown**: Markdown レンダリング
- **class-variance-authority**: スタイル管理
- **clsx + tailwind-merge**: クラス名の結合

## フォルダ構成

```
frontend/
├── app/                      # Next.js App Router
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ダッシュボード
│   ├── providers.tsx        # React Query Provider
│   ├── login/               # ログインページ
│   │   └── page.tsx
│   ├── tickets/             # チケット管理
│   │   ├── page.tsx         # チケット一覧
│   │   ├── new/             # 新規作成
│   │   │   ├── page.tsx
│   │   │   └── __tests__/
│   │   └── [id]/            # チケット詳細
│   │       ├── page.tsx
│   │       ├── edit/        # 編集
│   │       └── __tests__/
│   ├── knowledge/           # ナレッジベース
│   │   ├── page.tsx         # 記事一覧
│   │   ├── new/             # 新規作成
│   │   └── [id]/            # 記事詳細
│   └── admin/               # 管理機能
│       ├── page.tsx         # 管理ダッシュボード
│       ├── users/           # ユーザー管理
│       ├── teams/           # チーム管理
│       ├── categories/      # カテゴリ管理
│       ├── tags/            # タグ管理
│       ├── sla/             # SLA設定
│       └── audit-logs/      # 監査ログ
├── components/              # 再利用可能コンポーネント
│   ├── header.tsx           # ヘッダーナビゲーション
│   ├── protected-route.tsx  # 認証保護ルート
│   └── ui/                  # shadcn/ui コンポーネント
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                     # ユーティリティ・ロジック
│   ├── api-client.ts        # Axios インスタンス
│   ├── auth-context.tsx     # 認証コンテキスト
│   ├── types.ts             # 型定義
│   └── utils.ts             # ヘルパー関数
├── mocks/                   # MSWモック（テスト用）
│   ├── server.ts            # MSWサーバー設定
│   ├── data/
│   │   └── fixtures.ts      # モックデータ
│   └── handlers/            # APIハンドラー
│       ├── auth.ts
│       ├── tickets.ts
│       ├── admin.ts
│       └── index.ts
├── e2e/                     # Playwrightテスト
│   └── ticket-flow.spec.ts
├── __tests__/               # テストユーティリティ
│   └── test-utils.tsx
├── public/                  # 静的ファイル
├── vitest.config.mts        # Vitest設定
├── vitest.setup.ts          # テストセットアップ
├── playwright.config.ts     # Playwright設定
├── next.config.ts           # Next.js設定
├── tailwind.config.ts       # Tailwind設定
├── tsconfig.json            # TypeScript設定
└── package.json
```

## 環境構築

### 前提条件

- **Node.js**: 20.x 以上
- **npm**: 10.x 以上
- **バックエンド**: `backend/` ディレクトリのAPIサーバーが起動していること

### インストール

```bash
# 依存関係をインストール
npm install
```

### 開発サーバー起動

```bash
# 開発サーバーを起動（Turbopack使用）
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
# 本番用ビルド
npm run build

# 本番サーバー起動
npm start
```

### リンティング

```bash
# ESLintでコード品質チェック
npm run lint
```

## テスト方法

このプロジェクトでは単体テストとE2Eテストの両方を実装しています。

### 単体テスト（Vitest + React Testing Library）

MSWを使用してバックエンドAPIをモックし、コンポーネントのロジックをテストします。

```bash
# 全テストを実行
npm test

# UIモードで実行（インタラクティブ）
npm run test:ui

# カバレッジレポート付きで実行
npm run test:coverage
```

カバレッジレポートは `coverage/index.html` に生成されます。

**テスト例:**
- チケット詳細ページのレンダリング
- コメント投稿機能
- チケット作成フォーム
- タグの追加・削除

### E2Eテスト（Playwright）

実際のブラウザで動作を検証します。

**前提条件:** バックエンドサーバーを起動してください：

```bash
cd ../backend
docker-compose up -d

# マイグレーションとシード（初回のみ）
docker-compose exec backend alembic upgrade head
docker-compose exec backend python seed.py
```

**E2Eテストの実行:**

```bash
# ヘッドレスモードで実行
npm run test:e2e

# UIモードで実行（ブラウザが開く）
npm run test:e2e:ui
```

Playwrightは自動的にフロントエンド開発サーバーを起動します。

**テストアカウント:**
- オペレーター: `operator@example.com` / `testpass123`
- 管理者: `admin@example.com` / `testpass123`
- 一般ユーザー: `user@example.com` / `testpass123`

## 環境変数

必要に応じて `.env.local` を作成してください：

```env
# バックエンドAPIのURL（デフォルト: http://localhost:8000）
NEXT_PUBLIC_API_URL=http://localhost:8000

# E2Eテスト用のパスワード（デフォルト: testpass123）
E2E_OPERATOR_PASSWORD=testpass123
```

## 開発のヒント

### コンポーネントの追加

shadcn/ui のコンポーネントを追加する場合：

```bash
npx shadcn@latest add [component-name]
```

### APIクライアントの使用

```tsx
import apiClient from '@/lib/api-client';

// GET リクエスト
const response = await apiClient.get<Ticket[]>('/api/tickets');

// POST リクエスト
const response = await apiClient.post('/api/tickets', { title, description });
```

### 認証状態の取得

```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### TanStack Query の使用

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['tickets'],
  queryFn: async () => {
    const response = await apiClient.get('/api/tickets');
    return response.data;
  },
});
```

## トラブルシューティング

### ポート3000が使用中の場合

別のポートで起動：

```bash
PORT=3001 npm run dev
```

バックエンドのCORS設定も更新してください（`backend/app/main.py`）。

### テストが失敗する

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm run test -- --clearCache
```

### 型エラーが出る

```bash
# 型定義を再生成
rm -rf .next
npm run dev
```

## 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

## ライセンス

MIT
