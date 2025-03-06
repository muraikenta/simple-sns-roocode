import { describe, it, expect, afterEach } from "vitest";
import { supabase } from "../setup";
import { createTestUser, resetAuth } from "../helpers/auth";
import { cleanupTestUser, cleanupTestPost } from "../helpers/cleanup";

describe("Post Validation", () => {
  // テスト用のユーザーとデータ
  let testUser: { id: string; email: string; password: string } | null = null;
  let testPostId: string | null = null;

  // テスト後のクリーンアップ
  afterEach(async () => {
    // 認証状態をリセット
    await resetAuth();

    // テスト投稿を削除
    if (testPostId) {
      await cleanupTestPost(testPostId);
      testPostId = null;
    }

    // テストユーザーを削除
    if (testUser) {
      await cleanupTestUser(testUser.id);
      testUser = null;
    }
  });

  describe("content文字数バリデーション", () => {
    it("140文字以内の投稿は成功する", async () => {
      // テストユーザーを作成
      testUser = await createTestUser();

      // ユーザーとして認証
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      // 140文字の投稿を作成
      const content = "あ".repeat(140);
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: "テスト投稿",
          content,
          user_id: testUser.id,
        })
        .select()
        .single();

      // 投稿IDを保存
      if (data) {
        testPostId = data.id;
      }

      // エラーがないことを確認
      expect(error).toBeNull();
      // データが返されることを確認
      expect(data).not.toBeNull();
      // contentが期待通りであることを確認
      expect(data!.content).toEqual(content);
    });

    it("141文字の投稿は失敗する", async () => {
      // テストユーザーを作成
      testUser = await createTestUser();

      // ユーザーとして認証
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      // 141文字の投稿を作成
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: "テスト投稿",
          content: "あ".repeat(141),
          user_id: testUser.id,
        })
        .select()
        .single();

      // チェック制約違反のエラーが発生することを確認
      expect(error).not.toBeNull();
      expect(error!.code).toEqual("23514"); // チェック制約違反のエラーコード
      expect(data).toBeNull();
    });
  });
});