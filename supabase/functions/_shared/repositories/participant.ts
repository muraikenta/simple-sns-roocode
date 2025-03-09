import { BaseRepository } from "./base.ts";
import {
  ConversationParticipant,
  conversationParticipants,
  NewConversationParticipant,
} from "../db/schema.ts";
import { and, eq } from "drizzle-orm";

export class ParticipantRepository extends BaseRepository {
  // 参加者の追加
  async addParticipants(
    participants: NewConversationParticipant[]
  ): Promise<void> {
    await this.db.insert(conversationParticipants).values(participants);
  }

  // 会話の参加者を取得
  async getByConversationId(
    conversationId: string
  ): Promise<ConversationParticipant[]> {
    return await this.db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversation_id, conversationId));
  }

  // ユーザーが会話に参加しているか確認
  async isUserInConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const participant = await this.db
      .select({ id: conversationParticipants.id })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversation_id, conversationId),
          eq(conversationParticipants.user_id, userId)
        )
      )
      .limit(1);

    return participant.length > 0;
  }
}
