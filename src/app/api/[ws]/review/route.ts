import { NextRequest } from "next/server";
import {
  getDueReviews,
  gradeReview,
} from "@/features/review/application/service";
import { getEntry } from "@/features/entries/application/service";
import { getRecording } from "@/features/recordings/application/service";
import { getTarget } from "@/features/shadowing/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo } from "@/lib/today";
import type { ReviewKind } from "@/features/review/domain/Reviewable";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const today = todayInTokyo();
  const due = await getDueReviews(today);

  // Attach the source object so the client can render each item; drop any whose
  // source has been deleted.
  const items = await Promise.all(
    due.map(async (r) => {
      if (r.kind === "video") {
        const recording = await getRecording(r.refId);
        return recording ? { ...r, recording } : null;
      }
      if (r.kind === "shadowing") {
        const target = await getTarget(r.refId);
        return target ? { ...r, target } : null;
      }
      const entry = await getEntry(r.refId);
      return entry ? { ...r, entry } : null;
    })
  );

  return Response.json(items.filter(Boolean));
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { kind, refId, quality } = await request.json();
  if (!kind || !refId || typeof quality !== "number") {
    return Response.json(
      { error: "kind, refId, and numeric quality are required" },
      { status: 400 }
    );
  }

  const today = todayInTokyo();
  const next = await gradeReview(kind as ReviewKind, refId, quality, today);
  try {
    await logActivity(today, "review");
  } catch {}

  return Response.json(next);
});
