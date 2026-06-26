# 社内ヘルプアプリ - フロントエンド

チケット管理システムのフロントエンドアプリケーション。企業内のサポートチケット、ナレッジベース、ユーザー管理を提供する内部ツールです。バックエンドAPI（FastAPI）と連携し、認証、チケット管理、ナレッジ記事の表示・編集機能を実装しています。

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router) - ページルーティングとSSR
- **React 19** - UIコンポーネント
- **TypeScript** - 型安全性の確保
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UIコンポーネントライブラリ

### 状態管理・データフェッチ
- **Context API** - 認証状態管理（`lib/auth-context.tsx`）
- **fetch API** - APIクライアント（`lib/api-client.ts`）

### テスト
- **Vitest** - 単体テスト
- **React Testing Library** - コンポーネントテスト
- **Playwright** - E2Eテスト

### バックエンド連携
- **FastAPI バックエンド** - `../helpdesk-backend`
- **REST API** - JSONベースのデータ通信
- **JWT認証** - トークンベースの認証

## コーディングガイドライン

### 全般的な原則
- **一貫性**: プロジェクト全体で統一されたコーディングスタイルを維持
- **可読性**: 将来の自分や他の開発者が理解しやすいコードを書く
- **保守性**: 変更や拡張が容易な構造を心がける

### コミットとドキュメント
- コミットメッセージは変更内容を明確に記述
- 複雑なロジックにはコメントを追加
- READMEやドキュメントは常に最新の状態を保つ

### セキュリティとパフォーマンス
- 機密情報（APIキー、パスワード等）をコードに含めない
- パフォーマンスに影響する処理は最適化を検討
- ユーザー入力は必ずバリデーションを行う

### テストとデプロイ
- 新機能には必ずテストを追加
- 本番環境へのデプロイ前にローカルとステージング環境で動作確認
- CI/CDパイプラインを活用して品質を担保

## プロジェクト構造

- `app/` - Next.js App Router のページとレイアウト
  - `login/` - ログインページ
  - `tickets/` - チケット管理画面
  - `knowledge/` - ナレッジベース画面
  - `admin/` - 管理画面
- `components/` - 再利用可能なReactコンポーネント
  - `ui/` - shadcn/uiコンポーネント（Button, Card, Input等）
  - `header.tsx` - ナビゲーションヘッダー
  - `protected-route.tsx` - 認証ガード
- `lib/` - ユーティリティ関数と型定義
  - `types.ts` - TypeScript型定義（User, Ticket, Article等）
  - `api-client.ts` - APIクライアント
  - `auth-context.tsx` - 認証コンテキスト
  - `utils.ts` - 汎用ユーティリティ
- `__tests__/` - 単体テスト
- `e2e/` - E2Eテスト（Playwright）
- `mocks/` - テスト用のモックデータとハンドラ

## 利用可能なリソース

### スクリプト
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm test` - 単体テスト実行
- `npm run test:e2e` - E2Eテスト実行
- `npm run lint` - ESLint実行

### 重要な設定ファイル
- `tsconfig.json` - TypeScript設定
- `next.config.ts` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `playwright.config.ts` - Playwright設定

### バックエンドAPI仕様
バックエンドAPI仕様は `#file:../helpdesk-backend/docs/api-specification.md` を参照してください。

### 参考ドキュメント
- `README.md` - プロジェクトセットアップ手順
- `README-SETUP.md` - 環境構築の詳細手順
