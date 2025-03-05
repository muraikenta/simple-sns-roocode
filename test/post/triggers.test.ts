import { describe, it, expect, afterEach } from "vitest";
import { supabase } from "../setup";
import { createTestUser, resetAuth } from "../helpers/auth";
import { cleanupTestUser, cleanupTestPost } from "../helpers/cleanup";

describe("Post Database Triggers", () => {
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

  describe("update_updated_at_column トリガー", () => {
    it("投稿レコード更新時にupdated_atカラムが更新される", async () => {
      // テストユーザーを作成
      testUser = await createTestUser();

      // ユーザーとして認証
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      // テスト用の投稿を作成
      const { data: post } = await supabase
        .from("posts")
        .insert({
          title: "テスト投稿",
          content: "テスト内容",
          user_id: testUser.id,
        })
        .select()
        .single();

      // 投稿IDを保存
      testPostId = post!.id;

      // 作成直後のupdated_atを記録
      const originalUpdatedAt = new Date(post!.updated_at).getTime();

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 投稿を更新
      await supabase
        .from("posts")
        .update({ title: "更新後のタイトル" })
        .eq("id", testPostId);

      // 更新後の投稿を取得
      const { data: updatedPost } = await supabase
        .from("posts")
        .select("*")
        .eq("id", testPostId)
        .single();

      // updated_atが更新されていることを確認
      const newUpdatedAt = new Date(updatedPost!.updated_at).getTime();
      expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);
    });
  });
});
