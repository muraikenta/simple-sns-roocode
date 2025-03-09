import { Kysely } from "https://esm.sh/kysely@0.27.6";
import { PostgresDialect } from "https://esm.sh/kysely@0.27.6/dist/esm/dialect/postgres/postgres-dialect.js";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { Database } from "./schema.ts";

// シングルトンインスタンス
let dbInstance: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (dbInstance) return dbInstance;

  // 環境変数から接続情報を取得
  const connectionString = Deno.env.get("SUPABASE_DB_URL");
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // PostgreSQLクライアントの設定
  const pool = new Pool(connectionString, 10, true);

  // Kyselyインスタンスの作成
  dbInstance = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: {
        async connect() {
          const connection = await pool.connect();
          return {
            async query(sql, parameters) {
              const result = await connection.queryObject(sql, parameters);
              return {
                rows: result.rows,
              };
            },
            async release() {
              connection.release();
            },
          };
        },
        async destroy() {
          await pool.end();
        },
      },
    }),
    log: (event) => {
      if (event.level == "query") {
        const q = event.query;
        const time = Math.round(event.queryDurationMillis * 100) / 100;
        console.log(
          `\u001b[34mkysely:sql\u001b[0m [${q.sql}] parameters: [${q.parameters}] time: ${time}`
        );
      }
    },
  });

  return dbInstance;
}
