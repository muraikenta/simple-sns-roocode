import postgres from "npm:postgres@3.4.3";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

// シングルトンインスタンス
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  // 環境変数から接続情報を取得
  const connectionString = Deno.env.get("SUPABASE_DB_URL");
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // PostgreSQLクライアントの設定
  const client = postgres(connectionString, { prepare: false });

  // Drizzleインスタンスの作成
  dbInstance = drizzle(client, { schema });

  return dbInstance;
}
