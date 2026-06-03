import { recordingRepository } from "@/composition";
import type { Recording } from "../domain/Recording";

export function listRecordings(): Promise<Recording[]> {
  return recordingRepository.list();
}

export function getRecording(id: string): Promise<Recording | null> {
  return recordingRepository.get(id);
}

export function saveRecording(
  file: File,
  meta: { topic?: string; tags?: string[] }
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
