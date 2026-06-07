import { getShadowingTargetRepository } from "@/composition";
import {
  listRecordingsByTarget,
  deleteRecording,
} from "@/features/recordings/application/service";
import type { ShadowingTarget } from "../domain/ShadowingTarget";
import type { Recording } from "@/features/recordings/domain/Recording";

export function listTargets(): Promise<ShadowingTarget[]> {
  return getShadowingTargetRepository().list();
}

export function getTarget(id: string): Promise<ShadowingTarget | null> {
  return getShadowingTargetRepository().get(id);
}

export function createTarget(
  data: Omit<ShadowingTarget, "id" | "created">
): Promise<ShadowingTarget> {
  return getShadowingTargetRepository().create(data);
}

export async function getTargetWithAttempts(
  id: string
): Promise<{ target: ShadowingTarget; attempts: Recording[] } | null> {
  const target = await getShadowingTargetRepository().get(id);
  if (!target) return null;
  const attempts = await listRecordingsByTarget(id);
  return { target, attempts };
}

/** Deletes a target and all of its practice recordings (blobs + rows). */
export async function deleteTarget(id: string): Promise<boolean> {
  const attempts = await listRecordingsByTarget(id);
  for (const a of attempts) await deleteRecording(a.id);
  return getShadowingTargetRepository().delete(id);
}
