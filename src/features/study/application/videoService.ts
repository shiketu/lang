import { getVideoRepository, getClipRepository } from "@/composition";
import {
  listRecordingsByVideo,
  deleteRecording,
} from "@/features/recordings/application/service";
import type { Video, TranscriptLine } from "../domain/Video";

export function listVideos(): Promise<Video[]> {
  return getVideoRepository().list();
}

export function getVideo(id: string): Promise<Video | null> {
  return getVideoRepository().get(id);
}

export function createVideo(
  data: Omit<Video, "id" | "created">
): Promise<Video> {
  return getVideoRepository().create(data);
}

export function updateVideo(
  id: string,
  data: Partial<Video>
): Promise<Video | null> {
  return getVideoRepository().update(id, data);
}

export function saveTranscript(
  id: string,
  transcript: TranscriptLine[]
): Promise<Video | null> {
  return getVideoRepository().update(id, { transcript });
}

/** Deletes a video with everything under it: clips and all recordings. */
export async function deleteVideo(id: string): Promise<boolean> {
  const recordings = await listRecordingsByVideo(id);
  for (const r of recordings) await deleteRecording(r.id);

  const clips = await getClipRepository().list(id);
  for (const c of clips) await getClipRepository().delete(c.id);

  return getVideoRepository().delete(id);
}
