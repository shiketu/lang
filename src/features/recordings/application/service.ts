import { getRecordingRepository } from "@/composition";
import type { Recording } from "../domain/Recording";

export function listRecordings(): Promise<Recording[]> {
  return getRecordingRepository().list();
}

/** Practice attempts belonging to a shadowing target, newest first. */
export async function listRecordingsByTarget(targetId: string): Promise<Recording[]> {
  const all = await getRecordingRepository().list();
  return all.filter((r) => r.shadowingTargetId === targetId);
}

export function getRecording(id: string): Promise<Recording | null> {
  return getRecordingRepository().get(id);
}

export function saveRecording(
  file: File,
  meta: {
    topic?: string;
    category?: string;
    tags?: string[];
    shadowingTargetId?: string;
    segStart?: number;
    segEnd?: number;
  }
): Promise<Recording> {
  return getRecordingRepository().save(file, meta);
}

export function getRecordingBlob(id: string) {
  return getRecordingRepository().getBlob(id);
}

export function getRecordingSignedUrl(id: string): Promise<string | null> {
  return getRecordingRepository().getSignedUrl(id);
}

export function deleteRecording(id: string): Promise<boolean> {
  return getRecordingRepository().delete(id);
}
