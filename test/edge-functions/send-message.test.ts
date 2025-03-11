import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { adminSupabase, supabase } from "../setup";
import { authenticateAs, createTestUser } from "../helpers/auth";
import { cleanupTestData } from "../helpers/cleanup";

describe("Send Message Edge Function", () => {
  let testUser1: { id: string; email: string; password: string };
  let testUser2: { id: string; email: string; password: string };
  let conversationId: string;

  beforeEach(async () => {
    // テストユーザーの作成
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();

    // 認証
    await authenticateAs(testUser1.email, testUser1.password);

    // 会話の作成
    const createConversationResponse = await supabase.functions.invoke(
      "create-conversation",
      {
        body: {
          participant_ids: [testUser2.id],
        },
      },
    );

    const { data } = createConversationResponse;
    if (data && data.id) {
      conversationId = data.id;
    } else {
      throw new Error("Failed to create conversation for test");
    }
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await cleanupTestData([testUser1.id, testUser2.id]);
  });

  // 正常系テスト
  it("should send a message to a conversation", async () => {
    const messageContent = "Hello, this is a test message!";

    // Edge Functionの呼び出し
    const response = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: conversationId,
        content: messageContent,
      },
    });

    const { data, error } = response;

    // レスポンスの検証
    expect(error).toBeNull();
    expect(data).not.toBeNull();

    if (data) {
      expect(data.id).toBeDefined();
      expect(data.content).toBe(messageContent);
      expect(data.sender_id).toBe(testUser1.id);
      expect(data.conversation_id).toBe(conversationId);

      // データベースの検証
      const messagesResponse = await adminSupabase
        .from("messages")
        .select()
        .eq("id", data.id);

      const { data: messages, error: messagesError } = messagesResponse;

      expect(messages).not.toBeNull();
      expect(messagesError).toBeNull();

      if (messages && messages.length > 0) {
        const message = messages[0];
        expect(message.content).toBe(messageContent);
        expect(message.sender_id).toBe(testUser1.id);
        expect(message.conversation_id).toBe(conversationId);
      }
    }
  });

  // 異常系テスト
  it("should return error for empty message content", async () => {
    // Edge Functionの呼び出し（空のメッセージ）
    const response = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: conversationId,
        content: "",
      },
    });

    const { data, error } = response;

    // エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("should return error for non-participant user", async () => {
    // 別のテストユーザーを作成（会話に参加していない）
    const nonParticipantUser = await createTestUser();

    // 非参加者としてログイン
    await authenticateAs(nonParticipantUser.email, nonParticipantUser.password);

    // Edge Functionの呼び出し
    const response = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: conversationId,
        content: "This message should not be sent",
      },
    });

    const { data, error } = response;

    // エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();

    // クリーンアップ
    await cleanupTestData([nonParticipantUser.id]);
  });

  it("should return error for invalid conversation ID", async () => {
    const invalidConversationId = "00000000-0000-0000-0000-000000000000";

    // Edge Functionの呼び出し（無効な会話ID）
    const response = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: invalidConversationId,
        content: "This message should not be sent",
      },
    });

    const { data, error } = response;

    // エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("should require authentication", async () => {
    await supabase.auth.signOut();

    const response = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: conversationId,
        content: "This message should not be sent",
      },
    });

    const { data, error } = response;

    // 認証エラーが返されることを検証
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});
