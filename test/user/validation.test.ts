import { describe, it, expect, afterEach } from "vitest";
import { supabase } from "../setup";
import { resetAuth } from "../helpers/auth";
import { cleanupTestUser } from "../helpers/cleanup";

describe("User Validation", () => {
  // テスト用のユーザーID（クリーンアップ用）
  let testUserId: string | null = null;

  // テスト後のクリーンアップ
  afterEach(async () => {
    // 認証状態をリセット
    await resetAuth();

    // テストユーザーを削除
    if (testUserId) {
      await cleanupTestUser(testUserId);
      testUserId = null;
    }
  });

  describe("メールアドレスのバリデーション", () => {
    it("同じメールアドレスで複数のユーザーを登録できない", async () => {
      // 一意のメールアドレスを生成
      const email = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}@example.com`;
      const password = "password123";

      // 1人目のユーザーを登録（成功するはず）
      const { data: data1, error: error1 } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: `user_${Date.now()}` },
        },
      });

      // エラーがないことを確認
      expect(error1).toBeNull();
      expect(data1.user).not.toBeNull();

      // クリーンアップ用にユーザーIDを保存
      testUserId = data1.user!.id;

      // 同じメールアドレスで2人目のユーザーを登録（失敗するはず）
      const { error: error2 } = await supabase.auth.signUp({
        email,
        password: "differentpassword",
        options: {
          data: { username: `user_${Date.now() + 1}` },
        },
      });

      // エラーがあることを確認
      expect(error2).not.toBeNull();
      // Supabaseのエラーメッセージは「User already registered」または「Email already registered」などを含むはず
      expect(error2!.message).toMatch(/already registered/i);
    });

    it("無効なメールアドレス形式でユーザーを登録できない", async () => {
      // 無効なメールアドレス
      const invalidEmail = "invalid-email";
      const password = "password123";

      // 無効なメールアドレスでユーザーを登録（失敗するはず）
      const { error } = await supabase.auth.signUp({
        email: invalidEmail,
        password,
        options: {
          data: { username: `user_${Date.now()}` },
        },
      });

      // エラーがあることを確認
      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/invalid format/i);
    });
  });

  describe("パスワードのバリデーション", () => {
    it("短すぎるパスワードでユーザーを登録できない", async () => {
      // 一意のメールアドレスを生成
      const email = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}@example.com`;
      // 短いパスワード（Supabaseのデフォルト最小長は6文字）
      const shortPassword = "12345";

      // 短いパスワードでユーザーを登録（失敗するはず）
      const { error } = await supabase.auth.signUp({
        email,
        password: shortPassword,
        options: {
          data: { username: `user_${Date.now()}` },
        },
      });

      // エラーがあることを確認
      expect(error).not.toBeNull();
      // Supabaseのエラーメッセージは「Password should be at least 6 characters」などを含むはず
      expect(error!.message).toMatch(
        /password.*too short|at least \d+ characters/i
      );
    });

    it("十分な長さのパスワードでユーザーを登録できる", async () => {
      // 一意のメールアドレスを生成
      const email = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}@example.com`;
      // 十分な長さのパスワード
      const validPassword = "password123";

      // 有効なパスワードでユーザーを登録（成功するはず）
      const { data, error } = await supabase.auth.signUp({
        email,
        password: validPassword,
        options: {
          data: { username: `user_${Date.now()}` },
        },
      });

      // エラーがないことを確認
      expect(error).toBeNull();
      expect(data.user).not.toBeNull();

      // クリーンアップ用にユーザーIDを保存
      testUserId = data.user!.id;
    });
  });
});
