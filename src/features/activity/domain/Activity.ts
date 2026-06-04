// Every meaningful daily action is logged so we can show streaks, a heatmap,
// and which routine steps are done today.
export type ActivityKind =
  | "review" // graded a review item
  | "capture" // added/imported an expression into the library
  | "note" // saved a daily note
  | "output" // recorded a self-talk video
  | "practice" // did a free practice round
  | "shadowing"; // recorded a shadowing video (Phase C)

export interface ActivityLog {
  date: string; // YYYY-MM-DD
  kind: ActivityKind;
  count: number;
}

export interface ActivityRepository {
  /** Increments the counter for (date, kind) by `count` (default 1). */
  log(date: string, kind: ActivityKind, count?: number): Promise<void>;
  /** All logs with date in [from, to] inclusive. */
  range(from: string, to: string): Promise<ActivityLog[]>;
  forDate(date: string): Promise<ActivityLog[]>;
}
