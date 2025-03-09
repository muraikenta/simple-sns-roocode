import { supabase } from "../../lib/supabase";
import { IMessageRepository } from "../interfaces";

export class MessageRepository implements IMessageRepository {
  // 会話の作成
  async createConversation(participantIds: string[]): Promise<string> {
    const { data, error } = await supabase.functions.invoke(
      "create-conversation",
      {
        body: {
          participant_ids: participantIds,
        },
      }
    );

    if (error) throw error;
    return data.id;
  }

  // 会話に参加者を追加
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase.functions.invoke("add-participant", {
      body: {
        conversation_id: conversationId,
        user_id: userId,
      },
    });

    if (error) throw error;
  }

  // メッセージの送信
  async sendMessage(conversationId: string, content: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke("send-message", {
      body: {
        conversation_id: conversationId,
        content: content,
      },
    });

    if (error) throw error;
    return data.id;
  }

  // メッセージを既読にする
  async markMessagesAsRead(conversationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke("mark-messages-as-read", {
      body: {
        conversation_id: conversationId,
      },
    });

    if (error) throw error;
  }

  // ユーザーの会話一覧を取得
  async getUserConversations() {
    const { data, error } = await supabase.functions.invoke(
      "get-user-conversations"
    );

    if (error) throw error;
    return data;
  }

  // 会話のメッセージ一覧を取得
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    const { data, error } = await supabase.functions.invoke(
      "get-conversation-messages",
      {
        body: {
          conversation_id: conversationId,
          limit,
          offset,
        },
      }
    );

    if (error) throw error;
    return data;
  }
}
