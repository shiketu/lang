import { NextRequest } from "next/server";
import { listClips, createClip } from "@/features/study/application/clipService";
import { getVideo } from "@/features/study/application/videoService";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const videoRef = request.nextUrl.searchParams.get("videoRef") ?? undefined;
  return Response.json(await listClips(videoRef));
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { videoRef, title, segmentStart, segmentEnd } = await request.json();

  if (!videoRef || !(await getVideo(videoRef))) {
    return Response.json({ error: "Unknown video." }, { status: 400 });
  }
  if (
    typeof segmentStart !== "number" ||
    typeof segmentEnd !== "number" ||
    segmentEnd <= segmentStart
  ) {
    return Response.json({ error: "Invalid segment (start/end)." }, { status: 400 });
  }

  const clip = await createClip({
    videoRef,
    title: title?.trim() || "Untitled clip",
    segmentStart,
    segmentEnd,
  });

  return Response.json(clip, { status: 201 });
});
