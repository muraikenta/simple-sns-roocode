import { Kysely } from "https://esm.sh/kysely@0.27.6";
import { Database } from "../db/schema.ts";

export abstract class BaseRepository {
  constructor(protected db: Kysely<Database>) {}
}
