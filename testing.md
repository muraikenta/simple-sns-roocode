# テスト戦略ドキュメント

## 1. テスト対象

以下の重要なビジネスロジックに絞ってテストを行います：

### 1.1 RLS ポリシー（Row Level Security）

- ユーザーは自分の投稿のみ更新/削除できる
- ユーザーは自分のプロフィールのみ更新できる

### 1.2 データベーストリガー

- `handle_new_user`: 新規ユーザー登録時に`users`テーブルにレコードを自動作成
- `update_updated_at_column`: レコード更新時に`updated_at`カラムを更新

### 1.3 バリデーション

- メールアドレスの一意性（同じメールアドレスで複数登録できないか）
- パスワードの長さ要件（最小長など）

## 2. テスト環境

**選択したテスト環境: ローカルで実行するテスト専用の Supabase プロジェクト**

- 開発環境とは別のプロジェクトを作成
- ローカル環境で実行することで CI/CD との統合も容易
- テスト用のデータを安全に扱える
- `supabase start`コマンドで起動

### 2.1 テスト環境のセットアップ手順

1. テスト用のプロジェクトディレクトリを作成

   ```bash
   mkdir -p test/supabase
   ```

2. テスト用の設定ファイルを作成

   ```bash
   cd test
   npx supabase init --project-id simple-sns-roocode-test
   ```

3. マイグレーションとスキーマをシンボリックリンクで参照

   ```bash
   # マイグレーションディレクトリへのシンボリックリンクを作成
   ln -s ../supabase/migrations supabase/migrations

   # スキーマディレクトリへのシンボリックリンクを作成
   ln -s ../supabase/schemas supabase/schemas
   ```

   これにより、開発環境のマイグレーションやスキーマが更新されると、テスト環境にも自動的に反映されます。

### 2.2 テスト実行手順

1. テストディレクトリに移動し、Supabase を起動

   ```bash
   cd test
   npx supabase start
   ```

2. テストを実行

   ```bash
   cd ..  # プロジェクトルートに戻る
   npm test
   ```

   特定のテストファイルのみを実行する場合：

   ```bash
   npm test -- test/user/rls.test.ts
   ```

### 2.3 設定変更後のテスト環境リセット

`config.toml`などの設定ファイルを変更した場合、変更を反映するには以下の手順でDocker環境をクリーンアップする必要があります：

1. テスト環境を停止

   ```bash
   cd test
   npx supabase stop
   ```

2. Dockerボリュームを削除（データベースとストレージをクリーンアップ）

   ```bash
   docker volume rm supabase_db_simple-sns-roocode-test supabase_inbucket_simple-sns-roocode-test supabase_storage_simple-sns-roocode-test
   ```

3. 環境を再起動（クリーンな状態から）

   ```bash
   npx supabase start
   ```

これにより、キャッシュや古い設定が残らず、新しい設定が確実に反映されます。

## 3. テストツールとフレームワーク

### 3.1 テストフレームワーク

- **Vitest**: Vite をベースにした高速なテストフレームワーク
  - Vite プロジェクトとの統合が容易
  - Jest 互換 API を提供
  - 高速な実行と並列テスト

### 3.2 データベーステスト用ツール

- **Supabase JS Client**: Supabase との連携テスト
  - RLS ポリシーのテストに最適
  - 認証状態の切り替えが容易
  - Supabase の機能をフルに活用可能

### 3.3 テストヘルパー

- テストユーザー作成用のヘルパー関数
- テストデータクリーンアップ用のヘルパー関数
- 認証状態を切り替えるヘルパー関数

## 4. テスト実装方針

### 4.1 RLS ポリシーのテスト方法

1. **テスト内容**:

   - ユーザーが自分の投稿のみ更新/削除できることを確認
   - ユーザーが他人の投稿を更新/削除できないことを確認
   - ユーザーが自分のプロフィールのみ更新できることを確認
   - ユーザーが他人のプロフィールを更新できないことを確認

2. **テスト手法**:

   - 異なるユーザーとして認証状態を切り替えながらテスト
   - Supabase JS Client を使用して RLS ポリシーをテスト
   - 成功するべき操作と失敗するべき操作の両方をテスト

3. **テストコード例**:

   ```typescript
   it("ユーザーは自分の投稿のみ更新できる", async () => {
     // ユーザー1として認証
     await authenticateAs("user1@example.com", "password");

     // 自分の投稿を更新（成功するはず）
     const { error: error1 } = await supabase
       .from("posts")
       .update({ title: "更新されたタイトル" })
       .eq("id", "user1の投稿ID");

     expect(error1).toBeNull();

     // ユーザー2の投稿を更新（失敗するはず）
     const { error: error2 } = await supabase
       .from("posts")
       .update({ title: "不正な更新" })
       .eq("id", "user2の投稿ID");

     expect(error2).not.toBeNull();
   });
   ```

### 4.2 データベーストリガーのテスト方法

1. **テスト内容**:

   - `handle_new_user`トリガー: 新規ユーザー登録時に`users`テーブルにレコードが自動作成されることを確認
   - `update_updated_at_column`トリガー: レコード更新時に`updated_at`カラムが更新されることを確認

2. **テスト手法**:

   - Supabase JS Client を使用してトリガーの動作をテスト
   - タイムスタンプの比較によるトリガー動作の確認
   - トリガーによって作成されたレコードの検証

3. **テストコード例**:

   ```typescript
   // handle_new_userトリガーのテスト
   it("新規ユーザー登録時にusersテーブルにレコードが作成される", async () => {
     // 新規ユーザーを作成
     const email = `test-${Date.now()}@example.com`;
     const { data, error } = await supabase.auth.signUp({
       email,
       password: "password123",
       options: {
         data: { username: "testuser" },
       },
     });

     expect(error).toBeNull();

     // usersテーブルにレコードが作成されたか確認
     const { data: userData, error: userError } = await supabase
       .from("users")
       .select("*")
       .eq("id", data.user.id)
       .single();

     expect(userError).toBeNull();
     expect(userData).not.toBeNull();
     expect(userData.username).toBe("testuser");
   });

   // update_updated_at_columnトリガーのテスト
   it("レコード更新時にupdated_atカラムが更新される", async () => {
     // テスト用の投稿を作成
     const { data: post } = await supabase
       .from("posts")
       .insert({
         title: "テスト投稿",
         content: "テスト内容",
         user_id: "テストユーザーID",
       })
       .select()
       .single();

     // 作成直後のupdated_atを記録
     const originalUpdatedAt = new Date(post.updated_at).getTime();

     // 少し待機
     await new Promise((resolve) => setTimeout(resolve, 1000));

     // 投稿を更新
     await supabase
       .from("posts")
       .update({ title: "更新後のタイトル" })
       .eq("id", post.id);

     // 更新後の投稿を取得
     const { data: updatedPost } = await supabase
       .from("posts")
       .select("*")
       .eq("id", post.id)
       .single();

     // updated_atが更新されていることを確認
     const newUpdatedAt = new Date(updatedPost.updated_at).getTime();
     expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);
   });
   ```

### 4.3 バリデーションのテスト方法

1. **テスト内容**:

   - メールアドレスの一意性: 同じメールアドレスで複数のユーザーを登録できないことを確認
   - パスワードの長さ要件: 短すぎるパスワードでユーザーを登録できないことを確認

2. **テスト手法**:

   - エラーケースのテスト: 意図的に無効なデータを送信し、適切なエラーが返されることを確認
   - Supabase JS Client を使用してバリデーションをテスト
   - エラーメッセージの内容も検証

3. **テストコード例**:

   ```typescript
   // メールアドレスの一意性テスト
   it("同じメールアドレスで複数のユーザーを登録できない", async () => {
     // 1人目のユーザーを登録
     const email = `test-${Date.now()}@example.com`;
     const { error: error1 } = await supabase.auth.signUp({
       email,
       password: "password123",
     });

     expect(error1).toBeNull();

     // 同じメールアドレスで2人目のユーザーを登録（失敗するはず）
     const { error: error2 } = await supabase.auth.signUp({
       email,
       password: "differentpassword",
     });

     expect(error2).not.toBeNull();
     expect(error2.message).toContain("email already registered");
   });

   // パスワードの長さ要件テスト
   it("短すぎるパスワードでユーザーを登録できない", async () => {
     const email = `test-${Date.now()}@example.com`;

     // 短いパスワードでユーザーを登録（失敗するはず）
     const { error } = await supabase.auth.signUp({
       email,
       password: "short", // 5文字（最小は6文字）
     });

     expect(error).not.toBeNull();
     expect(error.message).toContain("password too short");
   });
   ```

### 4.4 テストデータの管理方法

1. **テストデータの分離**:

   - テスト間でのデータ競合を避けるため、各テストは独自のデータセットを使用
   - タイムスタンプやランダム文字列を使用して一意のテストデータを生成
   - テスト前後でデータをクリーンアップ

2. **テストヘルパー関数**:

   - テストユーザー作成用のヘルパー関数
   - テストデータクリーンアップ用のヘルパー関数
   - 認証状態を切り替えるヘルパー関数

3. **コード例**:

   ```typescript
   // テストユーザー作成用のヘルパー関数
   async function createTestUser(email?: string, password = "password123") {
     const testEmail =
       email ||
       `test-${Date.now()}-${Math.random()
         .toString(36)
         .substring(2, 9)}@example.com`;

     const { data, error } = await supabase.auth.signUp({
       email: testEmail,
       password,
       options: {
         data: { username: `user_${Date.now()}` },
       },
     });

     if (error) throw error;

     return {
       id: data.user.id,
       email: testEmail,
       password,
     };
   }

   // 認証状態を切り替えるヘルパー関数
   async function authenticateAs(email: string, password: string) {
     await supabase.auth.signOut();

     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });

     if (error) throw error;
   }

   // テストデータクリーンアップ用のヘルパー関数
   async function cleanupTestUser(userId: string) {
     // 関連する投稿を削除
     await supabase.from("posts").delete().eq("user_id", userId);

     // ユーザーを削除
     await supabase.from("users").delete().eq("id", userId);

     // 認証ユーザーを削除（管理者権限が必要）
     // 注: 実際のテスト環境では、管理者権限を持つクライアントを使用する必要があります
     await adminSupabase.auth.admin.deleteUser(userId);
   }

   // beforeEach/afterEachでのテストデータ管理
   beforeEach(async () => {
     // テストユーザーを作成
     testUser = await createTestUser();
   });

   afterEach(async () => {
     // テストデータをクリーンアップ
     if (testUser) {
       await cleanupTestUser(testUser.id);
     }

     // 認証状態をリセット
     await supabase.auth.signOut();
   });
   ```

## 5. テストのフォルダ構成

テストはドメインベース（機能領域ごと）のフォルダ構成で整理します。これにより、関連するテストが論理的にグループ化され、メンテナンス性と可読性が向上します。

### 5.1 基本構成

```
/test/
 ├── user/                  # ユーザー関連のテスト
 │   ├── rls.test.ts        # ユーザーのRLSポリシーテスト
 │   ├── validation.test.ts # ユーザーバリデーションテスト
 │   └── triggers.test.ts   # ユーザー関連トリガーテスト
 │
 ├── post/                  # 投稿関連のテスト
 │   ├── rls.test.ts        # 投稿のRLSポリシーテスト
 │   └── triggers.test.ts   # 投稿関連トリガーテスト
 │
 ├── helpers/               # テストヘルパー関数
 │   ├── auth.ts            # 認証関連ヘルパー
 │   └── cleanup.ts         # データクリーンアップヘルパー
 │
 └── setup.ts               # テスト全体の設定
```

### 5.2 テストファイルの命名規則

- テストファイルは `.test.ts` または `.spec.ts` で終わる
- ファイル名はテスト対象を明確に示す
- 複数の関連テストがある場合は、サブディレクトリを作成

### 5.3 テストグループ化の例

```typescript
// /test/user/rls.test.ts
describe("User RLS Policies", () => {
  describe("Profile Update Policy", () => {
    it("allows users to update their own profile", async () => {
      // テスト実装
    });

    it("prevents users from updating other users profiles", async () => {
      // テスト実装
    });
  });
});

// /test/post/rls.test.ts
describe("Post RLS Policies", () => {
  describe("Post Update Policy", () => {
    it("allows users to update their own posts", async () => {
      // テスト実装
    });

    it("prevents users from updating other users posts", async () => {
      // テスト実装
    });
  });

  describe("Post Delete Policy", () => {
    it("allows users to delete their own posts", async () => {
      // テスト実装
    });

    it("prevents users from deleting other users posts", async () => {
      // テスト実装
    });
  });
});
```
