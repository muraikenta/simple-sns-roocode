import { BaseRepository } from "./base.ts";
import { User, users } from "../db/schema.ts";
import { eq, inArray } from "drizzle-orm";

export class UserRepository extends BaseRepository {
  // ユーザーIDの存在確認
  async validateUserIds(
    userIds: string[]
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const result = await this.db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.id, userIds));

    const validUserIds = result.map((user: { id: string }) => user.id);
    const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

    return {
      valid: validUserIds,
      invalid: invalidUserIds,
    };
  }

  // ユーザー情報の取得
  async getById(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  // 複数ユーザーの情報を取得
  async getByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    return await this.db.select().from(users).where(inArray(users.id, ids));
  }
}
