import { addDays } from "./today";

export interface DayLog {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Collapses per-kind activity logs into a {date -> total count} map. */
export function dayTotals(logs: DayLog[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of logs) m.set(l.date, (m.get(l.date) ?? 0) + l.count);
  return m;
}

/**
 * Consecutive-day streak ending today. If today has no activity yet, the streak
 * is still counted from yesterday (so an in-progress day doesn't read as 0).
 */
export function currentStreak(activeDates: Set<string>, today: string): number {
  let streak = 0;
  let cursor = activeDates.has(today) ? today : addDays(today, -1);
  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
