import { NextRequest } from "next/server";
import {
  listRecordings,
  listRecordingsByClip,
  listRecordingsByVideo,
  listRetellsByVideo,
  saveRecording,
} from "@/features/recordings/application/service";
import { enqueueReview } from "@/features/review/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

/**
 * GET /recordings
 *   ?clipId=…             attempts for one clip
 *   ?videoRef=…           everything under one video
 *   ?videoRef=…&retell=1  only the video's retells (not tied to a clip)
 *   (no params)           everything
 */
export const GET = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = request.nextUrl;
  const clipId = searchParams.get("clipId");
  const videoRef = searchParams.get("videoRef");
  const retellOnly = searchParams.get("retell") === "1";

  if (clipId) return Response.json(await listRecordingsByClip(clipId));
  if (videoRef) {
    return Response.json(
      retellOnly
        ? await listRetellsByVideo(videoRef)
        : await listRecordingsByVideo(videoRef)
    );
  }
  return Response.json(await listRecordings());
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const topic = formData.get("topic") as string | null;
  const category = formData.get("category") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const videoRef = formData.get("videoRef") as string | null;
  const clipId = formData.get("clipId") as string | null;
  const segStartRaw = formData.get("segStart") as string | null;
  const segEndRaw = formData.get("segEnd") as string | null;
  const segStart = segStartRaw !== null ? Number(segStartRaw) : NaN;
  const segEnd = segEndRaw !== null ? Number(segEndRaw) : NaN;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const meta = await saveRecording(file, {
    topic: topic ?? undefined,
    category: category?.trim() ? category.trim() : undefined,
    tags: tagsRaw ? JSON.parse(tagsRaw) : [],
    videoRef: videoRef ?? undefined,
    clipId: clipId ?? undefined,
    segStart: Number.isFinite(segStart) ? segStart : undefined,
    segEnd: Number.isFinite(segEnd) ? segEnd : undefined,
  });

  const today = todayInTokyo();
  try {
    if (clipId) {
      // A clip attempt schedules that clip for review and logs shadowing.
      await enqueueReview("shadowing", clipId, addDays(today, 3));
      await logActivity(today, "shadowing");
    } else {
      // A retell is self-produced output: it resurfaces as a video review.
      await enqueueReview("video", meta.id, addDays(today, 3));
      await logActivity(today, "output");
    }
  } catch {}

  return Response.json(meta, { status: 201 });
});
