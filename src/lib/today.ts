// Single source of truth for "today" so server-side instrumentation and the
// client UI agree on the same day boundary (the user studies in Japan time).

const TZ = "Asia/Tokyo";

/** Returns today's date in Asia/Tokyo as "YYYY-MM-DD". */
export function todayInTokyo(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Adds (or subtracts) whole days to a "YYYY-MM-DD" string, returning the same format. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  // Use UTC math to avoid DST/local-offset drift; we only care about the date part.
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Whole-day difference a - b (both "YYYY-MM-DD"); positive when a is later. */
export function daysBetween(a: string, b: string): number {
  const toUTC = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(a) - toUTC(b)) / 86_400_000);
}
