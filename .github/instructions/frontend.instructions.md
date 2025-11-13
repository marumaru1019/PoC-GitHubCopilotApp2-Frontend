---
applyTo: "**/*.{ts,tsx}"
description: "TypeScript/React開発ガイドライン"
---

# TypeScript/React 開発ガイドライン

## Context Loading
実装前に以下を確認してください:
- [既存コンポーネントパターン](../../components/header.tsx)
- [型定義](../../lib/types.ts)
- [APIクライアント](../../lib/api-client.ts)

## Deterministic Requirements
- Server Components をデフォルトとし、必要な場合のみ `'use client'` を使用
- バックエンドのPydanticモデルに対応する型を `lib/types.ts` で定義
- shadcn/ui コンポーネント（Button, Card, Badge等）を優先的に使用
- `any` 型は避け、適切な型定義を使用

## Structured Output
コード生成時に以下を含める:
- [ ] インターフェース定義（Props, State等）
- [ ] エラーハンドリング
- [ ] 単体テスト（`__tests__/` ディレクトリ）
- [ ] アクセシビリティ対応（ARIA属性、セマンティックHTML）
