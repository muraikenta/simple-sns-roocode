import { BaseRepository } from "./base.ts";
import { User } from "../db/schema.ts";

export class UserRepository extends BaseRepository {
  // ユーザーIDの存在確認
  async validateUserIds(
    userIds: string[]
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const users = await this.db
      .selectFrom("users")
      .select("id")
      .where("id", "in", userIds)
      .execute();

    const validUserIds = users.map((user) => user.id);
    const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

    return {
      valid: validUserIds,
      invalid: invalidUserIds,
    };
  }

  // ユーザー情報の取得
  async getById(id: string): Promise<User | undefined> {
    return await this.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  // 複数ユーザーの情報を取得
  async getByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    return await this.db
      .selectFrom("users")
      .selectAll()
      .where("id", "in", ids)
      .execute();
  }
}
