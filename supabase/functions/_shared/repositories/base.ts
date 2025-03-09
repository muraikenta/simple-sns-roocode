import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema.ts";

export abstract class BaseRepository {
  constructor(protected db: ReturnType<typeof drizzle<typeof schema>>) {}
}
