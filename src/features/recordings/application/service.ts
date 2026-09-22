import { getRecordingRepository } from "@/composition";
import type { Recording } from "../domain/Recording";

export function listRecordings(): Promise<Recording[]> {
  return getRecordingRepository().list();
}

/** Practice attempts belonging to one clip, newest first. */
export async function listRecordingsByClip(clipId: string): Promise<Recording[]> {
  const all = await getRecordingRepository().list();
  return all.filter((r) => r.clipId === clipId);
}

/** Every recording under a video — clip attempts and retells alike. */
export async function listRecordingsByVideo(videoRef: string): Promise<Recording[]> {
  const all = await getRecordingRepository().list();
  return all.filter((r) => r.videoRef === videoRef);
}

/** Retell recordings for a video: attached to the video but not to any clip. */
export async function listRetellsByVideo(videoRef: string): Promise<Recording[]> {
  const all = await getRecordingRepository().list();
  return all.filter((r) => r.videoRef === videoRef && !r.clipId);
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
    videoRef?: string;
    clipId?: string;
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
