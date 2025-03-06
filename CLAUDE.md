# CLAUDE.md

このプロジェクトの開発ルールやコードスタイルガイドラインは `.clinerules` ファイルに記載されています。
常に最新の開発ルールに従うために、そちらを参照してください。

## Supabaseの設定変更時の注意点

`.clinerules` には記載されていない以下の手順も重要です：

設定ファイル（config.toml）変更後にテスト環境を正しく更新するには：

```bash
# 1. テスト環境を停止
cd test && npx supabase stop

# 2. Docker volumeを削除してキャッシュクリア
docker volume rm supabase_db_simple-sns-roocode-test supabase_inbucket_simple-sns-roocode-test supabase_storage_simple-sns-roocode-test

# 3. 環境を再起動（新しい設定を反映）
npx supabase start
```

この手順を行わないと、設定変更が反映されない場合があります。