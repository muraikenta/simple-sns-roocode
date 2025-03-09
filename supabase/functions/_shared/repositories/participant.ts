import { BaseRepository } from "./base.ts";
import {
  ConversationParticipant,
  NewConversationParticipant,
} from "../db/schema.ts";

export class ParticipantRepository extends BaseRepository {
  // 参加者の追加
  async addParticipants(
    participants: NewConversationParticipant[]
  ): Promise<void> {
    await this.db
      .insertInto("conversation_participants")
      .values(participants)
      .execute();
  }

  // 会話の参加者を取得
  async getByConversationId(
    conversationId: string
  ): Promise<ConversationParticipant[]> {
    return await this.db
      .selectFrom("conversation_participants")
      .selectAll()
      .where("conversation_id", "=", conversationId)
      .execute();
  }

  // ユーザーが会話に参加しているか確認
  async isUserInConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const participant = await this.db
      .selectFrom("conversation_participants")
      .select("id")
      .where("conversation_id", "=", conversationId)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return !!participant;
  }
}
