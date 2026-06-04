import type { Reviewable, ReviewKind } from "./Reviewable";

export interface ReviewRepository {
  /** Items due on/before `today`, soonest first. */
  listDue(today: string, limit?: number): Promise<Reviewable[]>;
  get(kind: ReviewKind, refId: string): Promise<Reviewable | null>;
  /** Adds a fresh scheduling record; no-op if one already exists (idempotent). */
  enqueue(kind: ReviewKind, refId: string, due: string): Promise<void>;
  /** Upserts the full SM-2 state (used after grading). */
  save(item: Reviewable): Promise<void>;
  dueCount(today: string): Promise<number>;
}
