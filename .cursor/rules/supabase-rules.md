# Supabase 関連ルール

## コマンド実行

Supabase コマンドは必ず npx 経由で実行してください。
これは、プロジェクトでグローバルインストールされた supabase コマンドに依存せず、常に適切なバージョンの supabase コマンドを使用するためです。

```bash
# 正しい実行方法
npx supabase migration up
```

## マイグレーション

マイグレーション手順は [Supabase の宣言的なデータベーススキーマアプローチ](https://supabase.com/docs/guides/local-development/declarative-database-schemas) に従って進めてください。

## ローカル開発

`supabase link`が必要なコマンド（例：`db push`, `db pull`, `migration repair`など）を実行する場合は、必ず`--local`オプションを付けてください。

```bash
# 正しい実行方法
npx supabase db push --local
npx supabase migration repair --status reverted 20250305 --local
```

## 型生成

Supabase のデータベーススキーマから自動的に TypeScript 型定義を生成するには、以下のコマンドを使用してください。

```bash
# 型定義ファイルの生成
npm run generate-types
```

型生成は以下のタイミングで実行してください：

1. **初期セットアップ時**：プロジェクトの初期セットアップ時
2. **スキーマ変更後**：データベーススキーマを変更した後
3. **マイグレーション適用後**：新しいマイグレーションを適用した後
