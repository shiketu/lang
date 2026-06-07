import { addDays } from "./today";

export interface DayLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface HeatCell {
  date: string;
  count: number;
  intensity: number; // 0..4
}

function dow(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun .. 6=Sat
}

/** Collapses per-kind activity logs into a {date -> total count} map. */
export function dayTotals(logs: DayLog[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of logs) m.set(l.date, (m.get(l.date) ?? 0) + l.count);
  return m;
}

/** Maps an activity count to a 0..4 heat intensity. */
export function intensity(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
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

/**
 * Builds a GitHub-style calendar grid: `weeks` columns × 7 rows (Sun..Sat),
 * ending on the Saturday of `today`'s week. Future cells are null. Month labels
 * mark the column where a new month first appears (in its top row).
 */
export function buildCalendar(
  totals: Map<string, number>,
  today: string,
  weeks: number
): { columns: (HeatCell | null)[][]; monthLabels: { col: number; month: number }[] } {
  const endOfWeek = addDays(today, 6 - dow(today)); // Saturday of current week
  const totalCells = weeks * 7;
  const start = addDays(endOfWeek, -(totalCells - 1)); // a Sunday

  const columns: (HeatCell | null)[][] = [];
  const monthLabels: { col: number; month: number }[] = [];
  let prevMonth = -1;

  for (let col = 0; col < weeks; col++) {
    const week: (HeatCell | null)[] = [];
    for (let row = 0; row < 7; row++) {
      const date = addDays(start, col * 7 + row);
      if (date > today) {
        week.push(null);
        continue;
      }
      const count = totals.get(date) ?? 0;
      week.push({ date, count, intensity: intensity(count) });
    }
    columns.push(week);

    // Month label based on the column's first day.
    const topDate = addDays(start, col * 7);
    const month = Number(topDate.split("-")[1]) - 1;
    if (month !== prevMonth) {
      monthLabels.push({ col, month });
      prevMonth = month;
    }
  }

  return { columns, monthLabels };
}
