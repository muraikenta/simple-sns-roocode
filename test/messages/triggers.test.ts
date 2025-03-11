import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { adminSupabase } from "../setup";
import { authenticateAs, createTestUser } from "../helpers/auth";
import { cleanupTestData } from "../helpers/cleanup";

describe("メッセージトリガー", () => {
  let testUser1: { id: string; email: string; password: string };
  let testUser2: { id: string; email: string; password: string };
  let conversationId: string;
  let messageId: string;

  beforeEach(async () => {
    // テストユーザーの作成
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();

    // 認証
    await authenticateAs(testUser1.email, testUser1.password);

    // 会話の作成
    const { data: conversationData } = await adminSupabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (conversationData) {
      conversationId = conversationData.id;

      // 参加者の追加
      await adminSupabase.from("conversation_participants").insert([
        { conversation_id: conversationId, user_id: testUser1.id },
        { conversation_id: conversationId, user_id: testUser2.id },
      ]);

      // メッセージの作成
      const { data: messageData } = await adminSupabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: testUser1.id,
          content: "テストメッセージ",
        })
        .select()
        .single();

      if (messageData) {
        messageId = messageData.id;
      }
    }
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    if (conversationId) {
      await adminSupabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      await adminSupabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", conversationId);

      await adminSupabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);
    }

    await cleanupTestData([testUser1.id, testUser2.id]);
  });

  describe("update_conversation_updated_at トリガー", () => {
    it("メッセージが挿入されたとき、会話のupdated_atが更新される", async () => {
      // 現在の会話のupdated_atを取得
      const { data: conversationBefore } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 新しいメッセージを挿入
      await adminSupabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: testUser1.id,
        content: "新しいテストメッセージ",
      });

      // 更新後の会話のupdated_atを取得
      const { data: conversationAfter } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // updated_atが更新されていることを確認
      const beforeTime = new Date(conversationBefore?.updated_at || "")
        .getTime();
      const afterTime = new Date(conversationAfter?.updated_at || "").getTime();
      expect(afterTime).toBeGreaterThan(beforeTime);
    });

    it("メッセージが更新されたとき、会話のupdated_atが更新される", async () => {
      // 現在の会話のupdated_atを取得
      const { data: conversationBefore } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // メッセージを更新
      await adminSupabase
        .from("messages")
        .update({ content: "更新されたテストメッセージ" })
        .eq("id", messageId);

      // 更新後の会話のupdated_atを取得
      const { data: conversationAfter } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // updated_atが更新されていることを確認
      const beforeTime = new Date(conversationBefore?.updated_at || "")
        .getTime();
      const afterTime = new Date(conversationAfter?.updated_at || "").getTime();
      expect(afterTime).toBeGreaterThan(beforeTime);
    });

    it("メッセージが削除されたとき、会話のupdated_atが更新される", async () => {
      // 現在の会話のupdated_atを取得
      const { data: conversationBefore } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // メッセージを削除
      await adminSupabase.from("messages").delete().eq("id", messageId);

      // 更新後の会話のupdated_atを取得
      const { data: conversationAfter } = await adminSupabase
        .from("conversations")
        .select("updated_at")
        .eq("id", conversationId)
        .single();

      // updated_atが更新されていることを確認
      const beforeTime = new Date(conversationBefore?.updated_at || "")
        .getTime();
      const afterTime = new Date(conversationAfter?.updated_at || "").getTime();
      expect(afterTime).toBeGreaterThan(beforeTime);
    });
  });
});
