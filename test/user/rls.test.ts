import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { supabase } from "../setup";
import { createTestUser, authenticateAs, resetAuth } from "../helpers/auth";
import { cleanupTestUser } from "../helpers/cleanup";

describe("User RLS Policies", () => {
  // テスト用のユーザー
  let testUser1: { id: string; email: string; password: string };
  let testUser2: { id: string; email: string; password: string };

  // テスト前の準備
  beforeEach(async () => {
    // テストユーザーを作成
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();
  });

  // テスト後のクリーンアップ
  afterEach(async () => {
    // 認証状態をリセット
    await resetAuth();

    // テストユーザーを削除
    if (testUser1) await cleanupTestUser(testUser1.id);
    if (testUser2) await cleanupTestUser(testUser2.id);
  });

  describe("Profile Update Policy", () => {
    it("ユーザーは自分のプロフィールを更新できる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // 自分のプロフィールを更新（成功するはず）
      const { error } = await supabase
        .from("users")
        .update({ username: "更新されたユーザー名" })
        .eq("id", testUser1.id);

      // エラーがないことを確認
      expect(error).toBeNull();

      // 更新されたデータを取得して確認
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("id", testUser1.id)
        .single();

      expect(data).not.toBeNull();
      expect(data!.username).toBe("更新されたユーザー名");
    });

    it("ユーザーは他人のプロフィールを更新できない", async () => {
      // 更新前のユーザー2のデータを取得
      const { data: beforeData } = await supabase
        .from("users")
        .select("username")
        .eq("id", testUser2.id)
        .single();

      const originalUsername = beforeData!.username;

      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // ユーザー2のプロフィールを更新しようとする（RLSポリシーにより失敗するはず）
      await supabase
        .from("users")
        .update({ username: "不正な更新" })
        .eq("id", testUser2.id);

      // 更新後のユーザー2のデータを取得
      const { data: afterData } = await supabase
        .from("users")
        .select("username")
        .eq("id", testUser2.id)
        .single();

      // RLSポリシーが正しく機能していれば、ユーザー名は変更されていないはず
      expect(afterData).not.toBeNull();
      expect(afterData!.username).toBe(originalUsername);
      expect(afterData!.username).not.toBe("不正な更新");
    });
  });

  describe("Profile Read Policy", () => {
    it("ユーザーは全てのユーザープロフィールを読み取れる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // 全てのユーザーを取得
      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .in("id", [testUser1.id, testUser2.id]);

      // エラーがないことを確認
      expect(error).toBeNull();

      // 両方のユーザーのデータが取得できることを確認
      expect(data).not.toBeNull();
      expect(data!.length).toBe(2);

      // 取得したデータにユーザー1とユーザー2のIDが含まれていることを確認
      const userIds = data!.map((user) => user.id);
      expect(userIds).toContain(testUser1.id);
      expect(userIds).toContain(testUser2.id);
    });
  });
});
