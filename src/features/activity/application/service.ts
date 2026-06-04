import { activityRepository } from "@/composition";
import type { ActivityKind, ActivityLog } from "../domain/Activity";

export function logActivity(
  date: string,
  kind: ActivityKind,
  count = 1
): Promise<void> {
  return activityRepository.log(date, kind, count);
}

export function getActivityRange(from: string, to: string): Promise<ActivityLog[]> {
  return activityRepository.range(from, to);
}

export function getActivityForDate(date: string): Promise<ActivityLog[]> {
  return activityRepository.forDate(date);
}
