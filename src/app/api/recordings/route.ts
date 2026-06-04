import { NextRequest } from "next/server";
import { listRecordings, saveRecording } from "@/features/recordings/application/service";
import { enqueueReview } from "@/features/review/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  // Self-talk list only — shadowing attempts live under their target.
  const recordings = await listRecordings();
  return Response.json(recordings.filter((r) => !r.shadowingTargetId));
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const topic = formData.get("topic") as string | null;
  const category = formData.get("category") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const shadowingTargetId = formData.get("shadowingTargetId") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const meta = await saveRecording(file, {
    topic: topic ?? undefined,
    category: category?.trim() ? category.trim() : undefined,
    tags: tagsRaw ? JSON.parse(tagsRaw) : [],
    shadowingTargetId: shadowingTargetId ?? undefined,
  });

  const today = todayInTokyo();
  try {
    if (shadowingTargetId) {
      // A shadowing attempt schedules its target for review and logs a shadowing.
      await enqueueReview("shadowing", shadowingTargetId, addDays(today, 3));
      await logActivity(today, "shadowing");
    } else {
      // A self-output video resurfaces for review; logs a daily output.
      await enqueueReview("video", meta.id, addDays(today, 3));
      await logActivity(today, "output");
    }
  } catch {}

  return Response.json(meta, { status: 201 });
}
