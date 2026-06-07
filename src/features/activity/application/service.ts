import { getActivityRepository } from "@/composition";
import type { ActivityKind, ActivityLog } from "../domain/Activity";

export function logActivity(
  date: string,
  kind: ActivityKind,
  count = 1
): Promise<void> {
  return getActivityRepository().log(date, kind, count);
}

export function getActivityRange(from: string, to: string): Promise<ActivityLog[]> {
  return getActivityRepository().range(from, to);
}

export function getActivityForDate(date: string): Promise<ActivityLog[]> {
  return getActivityRepository().forDate(date);
}
