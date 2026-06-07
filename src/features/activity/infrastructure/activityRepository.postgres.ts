import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { activityLog } from "@/lib/db/schema";
import type {
  ActivityKind,
  ActivityLog,
  ActivityRepository,
} from "../domain/Activity";

export class PostgresActivityRepository implements ActivityRepository {
  constructor(private ws: Workspace = "ja") {}

  async log(date: string, kind: ActivityKind, count = 1): Promise<void> {
    const db = getDb(this.ws);
    await db
      .insert(activityLog)
      .values({ date, kind, count })
      .onConflictDoUpdate({
        target: [activityLog.date, activityLog.kind],
        set: { count: sql`${activityLog.count} + ${count}` },
      });
  }

  async range(from: string, to: string): Promise<ActivityLog[]> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(activityLog)
      .where(and(gte(activityLog.date, from), lte(activityLog.date, to)));
    return rows as ActivityLog[];
  }

  async forDate(date: string): Promise<ActivityLog[]> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.date, date));
    return rows as ActivityLog[];
  }
}
