import { describe, it, expect, afterEach } from "vitest";
import { supabase } from "../setup";
import { createTestUser, resetAuth } from "../helpers/auth";
import { cleanupTestUser } from "../helpers/cleanup";

describe("User Database Triggers", () => {
  // テスト用のユーザー
  let testUser: { id: string; email: string; password: string } | null = null;

  // テスト後のクリーンアップ
  afterEach(async () => {
    // 認証状態をリセット
    await resetAuth();

    // テストユーザーを削除
    if (testUser) {
      await cleanupTestUser(testUser.id);
      testUser = null;
    }
  });

  describe("handle_new_user トリガー", () => {
    it("新規ユーザー登録時にusersテーブルにレコードが自動作成される", async () => {
      // 一意のメールアドレスとユーザー名を生成
      const email = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}@example.com`;
      const username = `testuser_${Date.now()}`;
      const password = "password123";

      // 新規ユーザーを作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      // エラーがないことを確認
      expect(error).toBeNull();
      expect(data.user).not.toBeNull();

      // クリーンアップ用にユーザーIDを保存
      testUser = {
        id: data.user!.id,
        email,
        password,
      };

      // handle_new_userトリガーが実行されるまで少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // usersテーブルにレコードが作成されたか確認
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user!.id)
        .single();

      // エラーがないことを確認
      expect(userError).toBeNull();

      // ユーザーデータが存在することを確認
      expect(userData).not.toBeNull();

      // ユーザー名が正しく設定されていることを確認
      expect(userData!.username).toBe(username);

      // created_atとupdated_atが設定されていることを確認
      expect(userData!.created_at).not.toBeNull();
      expect(userData!.updated_at).not.toBeNull();
    });

    it("ユーザー名が指定されていない場合はメールアドレスがユーザー名として使用される", async () => {
      // 一意のメールアドレスを生成
      const email = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}@example.com`;
      const password = "password123";

      // ユーザー名を指定せずに新規ユーザーを作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // ユーザー名を指定しない
      });

      // エラーがないことを確認
      expect(error).toBeNull();
      expect(data.user).not.toBeNull();

      // クリーンアップ用にユーザーIDを保存
      testUser = {
        id: data.user!.id,
        email,
        password,
      };

      // handle_new_userトリガーが実行されるまで少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // usersテーブルにレコードが作成されたか確認
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user!.id)
        .single();

      // エラーがないことを確認
      expect(userError).toBeNull();

      // ユーザーデータが存在することを確認
      expect(userData).not.toBeNull();

      // ユーザー名がメールアドレスと同じであることを確認
      expect(userData!.username).toBe(email);
    });
  });

  describe("update_updated_at_column トリガー", () => {
    it("ユーザーレコード更新時にupdated_atカラムが更新される", async () => {
      // テストユーザーを作成
      testUser = await createTestUser();

      // ユーザーとして認証
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      // 作成直後のユーザーデータを取得
      const { data: originalUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", testUser.id)
        .single();

      // 作成直後のupdated_atを記録
      const originalUpdatedAt = new Date(originalUser!.updated_at).getTime();

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ユーザーデータを更新
      await supabase
        .from("users")
        .update({ username: `updated_${Date.now()}` })
        .eq("id", testUser.id);

      // 更新後のユーザーデータを取得
      const { data: updatedUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", testUser.id)
        .single();

      // updated_atが更新されていることを確認
      const newUpdatedAt = new Date(updatedUser!.updated_at).getTime();
      expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);
    });
  });
});
