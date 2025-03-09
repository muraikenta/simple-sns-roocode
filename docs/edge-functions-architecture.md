# Supabase Edge Functions アーキテクチャ設計書

## 1. 概要

このドキュメントでは、DM システムのための Supabase Edge Functions 実装におけるアーキテクチャ設計とテスト方針について説明します。

### 1.1 目的

DM システムの機能を Supabase Edge Functions（Deno/TypeScript）を使用して実装し、フロントエンドからの直接データベースアクセスを禁止して、Edge Functions を経由したアクセスのみを許可することで、セキュリティとビジネスロジックの一元管理を実現します。

### 1.2 実装する機能

以下の 6 つの基本的な関数を実装します：

1. **create-conversation**: 会話を作成し、参加者を追加する関数
2. **add-participant**: 既存の会話に参加者を追加する関数
3. **send-message**: メッセージを送信する関数
4. **mark-messages-as-read**: メッセージを既読にする関数
5. **get-user-conversations**: ユーザーの会話一覧を取得する関数
6. **get-conversation-messages**: 会話のメッセージ一覧を取得する関数

## 2. アーキテクチャ

### 2.1 レイヤードアーキテクチャ

Edge Functions の実装には、以下のレイヤードアーキテクチャを採用します：

```
supabase/functions/
├── _shared/
│   ├── controllers/     # コントローラー層
│   ├── usecases/        # ユースケース層
│   ├── repositories/    # リポジトリ層
│   ├── helpers/         # ヘルパー層
│   ├── db/              # データベース関連
│   └── types/           # 型定義
├── create-conversation/
│   ├── index.ts         # エントリーポイント
│   ├── controller.ts    # コントローラー
│   └── usecase.ts       # ユースケース
└── ...
```

### 2.2 各層の役割

#### 2.2.1 コントローラー層

- HTTP リクエストの検証
- パラメータの抽出
- レスポンスの生成
- エラーハンドリング

```typescript
// _shared/controllers/base.ts
export abstract class BaseController<TRequest, TResponse> {
  async handleRequest(req: Request): Promise<Response> {
    // リクエスト処理の共通ロジック
  }

  // 抽象メソッド
  protected abstract isValidMethod(method: string): boolean;
  protected abstract parseRequest(req: Request): Promise<TRequest>;
  protected abstract validateRequest(data: TRequest): string | null;
  protected abstract executeUseCase(
    data: TRequest,
    userId: string
  ): Promise<TResponse>;
}
```

#### 2.2.2 ユースケース層

- ビジネスロジックの実装
- 複数のリポジトリを組み合わせた処理
- トランザクション管理

```typescript
// _shared/usecases/base.ts
export abstract class BaseUseCase<TParams, TResult> {
  abstract execute(params: TParams, userId: string): Promise<TResult>;
}
```

#### 2.2.3 リポジトリ層

- データベースアクセスの抽象化
- Kysely を使用したクエリ実行

```typescript
// _shared/repositories/base.ts
export abstract class BaseRepository {
  constructor(protected db: Kysely<Database>) {}
}
```

#### 2.2.4 ヘルパー層

- 認証
- CORS
- レスポンス生成
- その他の共通機能

```typescript
// _shared/helpers/auth.ts
export async function getUserId(req: Request): Promise<string | null> {
  // 認証ロジック
}
```

### 2.3 データベースアクセス

データベースアクセスには、Kysely を使用します。Kysely は型安全な SQL クエリビルダーで、トランザクションのサポートも充実しています。

```typescript
// _shared/db/client.ts
export function getDb(): Kysely<Database> {
  // Kyselyインスタンスの作成
}
```

## 3. テスト戦略

### 3.1 テスト構成

```
test/
└── edge-functions/
    ├── create-conversation.test.ts
    ├── add-participant.test.ts
    ├── send-message.test.ts
    └── ...
```

### 3.2 テストアプローチ

E2E テストを中心に実装し、以下のアプローチを取ります：

1. テスト前にテストユーザーを作成
2. Edge Function を呼び出し
3. レスポンスを検証
4. データベースの状態を検証
5. テスト後にテストデータをクリーンアップ

### 3.3 テストケース

各関数のテストでは、以下のようなテストケースを実装します：

#### 3.3.1 create-conversation

- 正常系テスト

  - 会話の作成と参加者の追加が正しく行われることを確認
  - 現在のユーザーが自動的に参加者に追加されることを確認

- 異常系テスト
  - 無効なユーザー ID の場合にエラーが返されることを確認
  - 認証されていない場合にエラーが返されることを確認

#### 3.3.2 send-message

- 正常系テスト

  - メッセージが正しく送信されることを確認
  - 送信者 ID が正しく設定されることを確認

- 異常系テスト
  - 空のメッセージ内容でエラーが返されることを確認
  - 存在しない会話 ID でエラーが返されることを確認
  - 参加していない会話へのメッセージ送信でエラーが返されることを確認
  - 認証されていない場合にエラーが返されることを確認

### 3.4 テスト実行

テストは以下のコマンドで実行します：

```bash
# すべてのテストを実行
npm run test

# 特定のテストファイルのみ実行
npm run test test/edge-functions/create-conversation.test.ts
```

### 3.5 テスト環境

テストを実行するためには、以下の準備が必要です：

- Supabase のローカル開発環境が起動していること
- Edge Functions がデプロイされていること
- テスト用のヘルパー関数（createTestUser, authenticateAs, cleanupTestData）が実装されていること

## 4. 実装計画

### 4.1 優先順位

以下の順序で実装を進めます：

1. `create-conversation`関数の実装
2. `create-conversation`関数の E2E テスト実装
3. `send-message`関数の実装
4. `send-message`関数の E2E テスト実装
5. 残りの関数を同様のパターンで実装

### 4.2 実装手順

各関数の実装は以下の手順で進めます：

1. レイヤードアーキテクチャに基づいて関数を実装

   - コントローラー層、ユースケース層、リポジトリ層、ヘルパー層の実装
   - Kysely を使用したデータベースアクセスの実装

2. E2E テストを実装

   - 正常系テスト
   - 異常系テスト

3. テストを実行して動作確認

4. コミット

## 5. クライアント側の実装

クライアント側では、`src/repositories/supabase/MessageRepository.ts`を作成し、Edge Functions を呼び出すメソッドを実装します：

```typescript
import { supabase } from "../../lib/supabase";

export class MessageRepository {
  // 会話の作成
  async createConversation(participantIds: string[]): Promise<string> {
    const { data, error } = await supabase.functions.invoke(
      "create-conversation",
      {
        body: {
          participant_ids: participantIds,
        },
      }
    );

    if (error) throw error;
    return data.id;
  }

  // 他のメソッドも同様に実装...
}
```

また、`src/repositories/factory.ts`を修正して、MessageRepository を追加します：

```typescript
import { MessageRepository } from "./supabase/MessageRepository";

export const createMessageRepository = () => new MessageRepository();
```
