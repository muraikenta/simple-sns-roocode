import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { supabase } from "../setup";
import { createTestUser, authenticateAs, resetAuth } from "../helpers/auth";
import { cleanupTestUser, cleanupTestPost } from "../helpers/cleanup";

describe("Post RLS Policies", () => {
  // テスト用のユーザー
  let testUser1: { id: string; email: string; password: string };
  let testUser2: { id: string; email: string; password: string };

  // テスト用の投稿ID
  let testPost1Id: string;
  let testPost2Id: string;

  /**
   * テスト投稿を作成するヘルパー関数
   * @param userId 投稿者のユーザーID
   * @param title 投稿タイトル（省略時はデフォルト値）
   * @param content 投稿内容（省略時はデフォルト値）
   * @returns 作成された投稿のID
   */
  async function createTestPost(
    userId: string,
    title = `テスト投稿 ${Date.now()}`,
    content = `これはテスト投稿の内容です。作成時刻: ${new Date().toISOString()}`
  ): Promise<string> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        user_id: userId,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  // テスト前の準備
  beforeEach(async () => {
    // テストユーザーを作成
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();

    // ユーザー1として認証
    await authenticateAs(testUser1.email, testUser1.password);

    // ユーザー1の投稿を作成
    testPost1Id = await createTestPost(
      testUser1.id,
      "ユーザー1の投稿",
      "ユーザー1の投稿内容"
    );

    // ユーザー2として認証
    await authenticateAs(testUser2.email, testUser2.password);

    // ユーザー2の投稿を作成
    testPost2Id = await createTestPost(
      testUser2.id,
      "ユーザー2の投稿",
      "ユーザー2の投稿内容"
    );

    // 認証状態をリセット
    await resetAuth();
  });

  // テスト後のクリーンアップ
  afterEach(async () => {
    // 認証状態をリセット
    await resetAuth();

    // テスト投稿を削除
    if (testPost1Id) await cleanupTestPost(testPost1Id);
    if (testPost2Id) await cleanupTestPost(testPost2Id);

    // テストユーザーを削除
    if (testUser1) await cleanupTestUser(testUser1.id);
    if (testUser2) await cleanupTestUser(testUser2.id);
  });

  describe("Post Insert Policy", () => {
    it("ユーザーは自分のIDで投稿を作成できる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // 自分のIDで投稿を作成（成功するはず）
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: "新しい投稿",
          content: "これは新しい投稿の内容です",
          user_id: testUser1.id,
        })
        .select("id")
        .single();

      // エラーがないことを確認
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      // 作成された投稿をクリーンアップ
      if (data && data.id) await cleanupTestPost(data.id);
    });

    it("ユーザーは他人のIDで投稿を作成できない", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // ユーザー2のIDで投稿を作成しようとする（RLSポリシーにより失敗するはず）
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: "不正な投稿",
          content: "これは他人のIDで作成しようとした投稿です",
          user_id: testUser2.id,
        })
        .select("id")
        .single();

      // エラーがあることを確認
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe("Post Update Policy", () => {
    it("ユーザーは自分の投稿を更新できる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // 自分の投稿を更新（成功するはず）
      const { error } = await supabase
        .from("posts")
        .update({ title: "更新されたタイトル" })
        .eq("id", testPost1Id);

      // エラーがないことを確認
      expect(error).toBeNull();

      // 更新されたデータを取得して確認
      const { data } = await supabase
        .from("posts")
        .select("title")
        .eq("id", testPost1Id)
        .single();

      expect(data).not.toBeNull();
      expect(data!.title).toBe("更新されたタイトル");
    });

    it("ユーザーは他人の投稿を更新できない", async () => {
      // 更新前のユーザー2の投稿データを取得
      const { data: beforeData } = await supabase
        .from("posts")
        .select("title")
        .eq("id", testPost2Id)
        .single();

      const originalTitle = beforeData!.title;

      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // ユーザー2の投稿を更新しようとする（RLSポリシーにより失敗するはず）
      await supabase
        .from("posts")
        .update({ title: "不正な更新" })
        .eq("id", testPost2Id);

      // 更新後のユーザー2の投稿データを取得
      const { data: afterData } = await supabase
        .from("posts")
        .select("title")
        .eq("id", testPost2Id)
        .single();

      // RLSポリシーが正しく機能していれば、タイトルは変更されていないはず
      expect(afterData).not.toBeNull();
      expect(afterData!.title).toBe(originalTitle);
      expect(afterData!.title).not.toBe("不正な更新");
    });
  });

  describe("Post Delete Policy", () => {
    it("ユーザーは自分の投稿を削除できる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // テスト用の投稿を作成
      const { data: createData } = await supabase
        .from("posts")
        .insert({
          title: "削除するテスト投稿",
          content: "この投稿は削除されます",
          user_id: testUser1.id,
        })
        .select("id")
        .single();

      const tempPostId = createData!.id;

      // 投稿が作成されたことを確認
      const { data: checkData } = await supabase
        .from("posts")
        .select("id")
        .eq("id", tempPostId)
        .single();

      expect(checkData).not.toBeNull();

      // 自分の投稿を削除（成功するはず）
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", tempPostId);

      // エラーがないことを確認
      expect(error).toBeNull();

      // 投稿が削除されたことを確認
      const { data: afterDeleteData, error: afterDeleteError } = await supabase
        .from("posts")
        .select("id")
        .eq("id", tempPostId)
        .single();

      // データが見つからないエラーが発生するはず
      expect(afterDeleteError).not.toBeNull();
      expect(afterDeleteData).toBeNull();
    });

    it("ユーザーは他人の投稿を削除できない", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // ユーザー2の投稿を削除しようとする（RLSポリシーにより失敗するはず）
      await supabase.from("posts").delete().eq("id", testPost2Id);

      // 投稿がまだ存在することを確認
      const { data, error } = await supabase
        .from("posts")
        .select("id")
        .eq("id", testPost2Id)
        .single();

      // エラーがないことを確認（投稿が見つかる）
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.id).toBe(testPost2Id);
    });
  });

  describe("Post Read Policy", () => {
    it("ユーザーは全ての投稿を読み取れる", async () => {
      // ユーザー1として認証
      await authenticateAs(testUser1.email, testUser1.password);

      // 全ての投稿を取得
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, user_id")
        .in("id", [testPost1Id, testPost2Id]);

      // エラーがないことを確認
      expect(error).toBeNull();

      // 両方の投稿のデータが取得できることを確認
      expect(data).not.toBeNull();
      expect(data!.length).toBe(2);

      // 取得したデータに両方の投稿IDが含まれていることを確認
      const postIds = data!.map((post) => post.id);
      expect(postIds).toContain(testPost1Id);
      expect(postIds).toContain(testPost2Id);
    });
  });
});
