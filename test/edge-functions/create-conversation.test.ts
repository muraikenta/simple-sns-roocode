import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { adminSupabase, supabase } from "../setup";
import { createTestUser, authenticateAs } from "../helpers/auth";
import { cleanupTestData } from "../helpers/cleanup";

describe("Create Conversation Edge Function", () => {
  let testUser1: { id: string; email: string; password: string };
  let testUser2: { id: string; email: string; password: string };

  beforeEach(async () => {
    // テストユーザーの作成
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();

    // 認証
    await authenticateAs(testUser1.email, testUser1.password);
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await cleanupTestData([testUser1.id, testUser2.id]);
  });

  // 正常系テスト
  it("should create a conversation with participants", async () => {
    // Edge Functionの呼び出し
    const response = await supabase.functions.invoke("create-conversation", {
      body: {
        participant_ids: [testUser2.id],
      },
    });

    const { data, error } = response;

    // レスポンスの検証
    expect(error).toBeNull();
    expect(data).not.toBeNull();

    if (data) {
      expect(data.id).toBeDefined();

      // データベースの検証
      const participantsResponse = await adminSupabase
        .from("conversation_participants")
        .select()
        .eq("conversation_id", data.id);

      const { data: participants, error: participantsError } =
        participantsResponse;

      expect(participants).not.toBeNull();
      expect(participants).toHaveLength(2);
      expect(participantsError).toBeNull();

      if (participants) {
        const participantUserIds = participants.map((p) => p.user_id);
        expect(participantUserIds).toContain(testUser1.id);
        expect(participantUserIds).toContain(testUser2.id);
      }
    }
  });

  it("should add current user to participants if not included", async () => {
    // Edge Functionの呼び出し（自分自身を含めない）
    const response = await supabase.functions.invoke("create-conversation", {
      body: {
        participant_ids: [testUser2.id],
      },
    });

    const { data, error } = response;

    // 検証
    expect(error).toBeNull();

    if (data) {
      expect(data.id).toBeDefined();

      // データベースの検証
      const participantsResponse = await adminSupabase
        .from("conversation_participants")
        .select()
        .eq("conversation_id", data.id);

      const { data: participants, error: participantsError } =
        participantsResponse;

      if (participantsError) {
        console.error("Error querying participants:", participantsError);
      }

      expect(participants).not.toBeNull();

      if (participants) {
        // 自分自身が自動的に追加されていることを確認
        const participantUserIds = participants.map((p) => p.user_id);
        console.log("Participant user IDs:", participantUserIds);
        expect(participantUserIds).toContain(testUser1.id);
      }
    }
  });

  // 異常系テスト
  it("should return error for invalid user IDs", async () => {
    const invalidUserId = "00000000-0000-0000-0000-000000000000";
    // Edge Functionの呼び出し（無効なユーザーID）
    const response = await supabase.functions.invoke("create-conversation", {
      body: {
        participant_ids: [invalidUserId],
      },
    });

    const { data, error } = response;

    // エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("should require authentication", async () => {
    await supabase.auth.signOut();

    const response = await supabase.functions.invoke("create-conversation", {
      body: {
        participant_ids: [testUser2.id],
      },
    });

    const { data, error } = response;

    // 認証エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});
