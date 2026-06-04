import { and, eq, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { reviewSchedule } from "@/lib/db/schema";
import type { Reviewable, ReviewKind } from "../domain/Reviewable";
import type { ReviewRepository } from "../domain/ReviewRepository";

type Row = typeof reviewSchedule.$inferSelect;

function toReviewable(r: Row): Reviewable {
  return {
    kind: r.kind,
    refId: r.refId,
    ease: r.ease,
    intervalDays: r.intervalDays,
    repetitions: r.repetitions,
    due: r.due,
    lastReviewed: r.lastReviewed ?? undefined,
    created: r.created,
  };
}

export class PostgresReviewRepository implements ReviewRepository {
  async listDue(today: string, limit = 50): Promise<Reviewable[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(reviewSchedule)
      .where(lte(reviewSchedule.due, today))
      .orderBy(reviewSchedule.due)
      .limit(limit);
    return rows.map(toReviewable);
  }

  async get(kind: ReviewKind, refId: string): Promise<Reviewable | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.kind, kind), eq(reviewSchedule.refId, refId)))
      .limit(1);
    return rows[0] ? toReviewable(rows[0]) : null;
  }

  async enqueue(kind: ReviewKind, refId: string, due: string): Promise<void> {
    const db = getDb();
    await db
      .insert(reviewSchedule)
      .values({
        kind,
        refId,
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        due,
        lastReviewed: null,
        created: new Date().toISOString(),
      })
      .onConflictDoNothing();
  }

  async save(item: Reviewable): Promise<void> {
    const db = getDb();
    await db
      .insert(reviewSchedule)
      .values({
        kind: item.kind,
        refId: item.refId,
        ease: item.ease,
        intervalDays: item.intervalDays,
        repetitions: item.repetitions,
        due: item.due,
        lastReviewed: item.lastReviewed ?? null,
        created: item.created,
      })
      .onConflictDoUpdate({
        target: [reviewSchedule.kind, reviewSchedule.refId],
        set: {
          ease: item.ease,
          intervalDays: item.intervalDays,
          repetitions: item.repetitions,
          due: item.due,
          lastReviewed: item.lastReviewed ?? null,
        },
      });
  }

  async dueCount(today: string): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ c: sql<number>`count(*)` })
      .from(reviewSchedule)
      .where(lte(reviewSchedule.due, today));
    return Number(rows[0]?.c ?? 0);
  }
}
