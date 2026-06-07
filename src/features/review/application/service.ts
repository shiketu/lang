import { getReviewRepository } from "@/composition";
import { applySM2, SM2_DEFAULT } from "@/lib/sm2";
import type { Reviewable, ReviewKind } from "../domain/Reviewable";

export function getDueReviews(today: string, limit?: number): Promise<Reviewable[]> {
  return getReviewRepository().listDue(today, limit);
}

export function getDueCount(today: string): Promise<number> {
  return getReviewRepository().dueCount(today);
}

/** Schedules a fresh reviewable (idempotent — keeps existing schedule if present). */
export function enqueueReview(
  kind: ReviewKind,
  refId: string,
  due: string
): Promise<void> {
  return getReviewRepository().enqueue(kind, refId, due);
}

/** Applies an SM-2 grade and persists the next schedule. Auto-creates on first grade. */
export async function gradeReview(
  kind: ReviewKind,
  refId: string,
  quality: number,
  today: string
): Promise<Reviewable> {
  const existing = await getReviewRepository().get(kind, refId);
  const base: Reviewable =
    existing ?? {
      kind,
      refId,
      ...SM2_DEFAULT,
      due: today,
      created: new Date().toISOString(),
    };
  const next = applySM2(base, quality, today);
  const saved: Reviewable = { ...base, ...next, lastReviewed: today };
  await getReviewRepository().save(saved);
  return saved;
}
