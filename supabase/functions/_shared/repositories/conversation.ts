import { BaseRepository } from "./base.ts";
import { Conversation, NewConversation } from "../db/schema.ts";

export class ConversationRepository extends BaseRepository {
  // 会話の作成
  async create(): Promise<Conversation> {
    const result = await this.db
      .insertInto("conversations")
      .defaultValues()
      .returning(["id", "created_at", "updated_at"])
      .execute();

    return result[0] as Conversation;
  }

  // 会話の取得
  async getById(id: string): Promise<Conversation | undefined> {
    return await this.db
      .selectFrom("conversations")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
}
