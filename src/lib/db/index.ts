import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import type { Workspace } from "@/lib/workspace";

// One connection pool per workspace (separate databases).
const pools: Partial<Record<Workspace, Pool>> = {};

export function getDb(ws: Workspace = "ja") {
  if (!pools[ws]) {
    const connectionString =
      ws === "en" ? process.env.DATABASE_URL_EN : process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        `DATABASE_URL${ws === "en" ? "_EN" : ""} is not set`
      );
    }
    pools[ws] = new Pool({ connectionString });
  }
  return drizzle(pools[ws]!, { schema });
}

export type Database = ReturnType<typeof getDb>;
export { schema };
