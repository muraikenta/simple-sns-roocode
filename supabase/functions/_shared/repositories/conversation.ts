import { BaseRepository } from "./base.ts";
import { Conversation, conversations } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export class ConversationRepository extends BaseRepository {
  // 会話の作成
  async create(): Promise<Conversation> {
    const result = await this.db.insert(conversations).values({}).returning();

    return result[0];
  }

  // 会話の取得
  async getById(id: string): Promise<Conversation | undefined> {
    const result = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    return result[0];
  }
}
