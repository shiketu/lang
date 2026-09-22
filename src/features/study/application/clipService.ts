import { getClipRepository } from "@/composition";
import {
  listRecordingsByClip,
  deleteRecording,
} from "@/features/recordings/application/service";
import type { Clip } from "../domain/Clip";
import type { Recording } from "@/features/recordings/domain/Recording";

export function listClips(videoRef?: string): Promise<Clip[]> {
  return getClipRepository().list(videoRef);
}

export function getClip(id: string): Promise<Clip | null> {
  return getClipRepository().get(id);
}

export function createClip(
  data: Omit<Clip, "id" | "created">
): Promise<Clip> {
  return getClipRepository().create(data);
}

export async function getClipWithAttempts(
  id: string
): Promise<{ clip: Clip; attempts: Recording[] } | null> {
  const clip = await getClipRepository().get(id);
  if (!clip) return null;
  const attempts = await listRecordingsByClip(id);
  return { clip, attempts };
}

/** Deletes a clip and all of its practice recordings (blobs + rows). */
export async function deleteClip(id: string): Promise<boolean> {
  const attempts = await listRecordingsByClip(id);
  for (const a of attempts) await deleteRecording(a.id);
  return getClipRepository().delete(id);
}
