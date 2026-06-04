import { recordingRepository } from "@/composition";
import type { Recording } from "../domain/Recording";

export function listRecordings(): Promise<Recording[]> {
  return recordingRepository.list();
}

/** Practice attempts belonging to a shadowing target, newest first. */
export async function listRecordingsByTarget(targetId: string): Promise<Recording[]> {
  const all = await recordingRepository.list();
  return all.filter((r) => r.shadowingTargetId === targetId);
}

export function getRecording(id: string): Promise<Recording | null> {
  return recordingRepository.get(id);
}

export function saveRecording(
  file: File,
  meta: {
    topic?: string;
    category?: string;
    tags?: string[];
    shadowingTargetId?: string;
  }
): Promise<Recording> {
  return recordingRepository.save(file, meta);
}

export function getRecordingBlob(id: string) {
  return recordingRepository.getBlob(id);
}

export function getRecordingSignedUrl(id: string): Promise<string | null> {
  return recordingRepository.getSignedUrl(id);
}

export function deleteRecording(id: string): Promise<boolean> {
  return recordingRepository.delete(id);
}
