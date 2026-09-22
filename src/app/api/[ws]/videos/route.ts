import { NextRequest } from "next/server";
import { listVideos, createVideo } from "@/features/study/application/videoService";
import { parseYouTube } from "@/lib/youtube";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  return Response.json(await listVideos());
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { referenceUrl, title, category } = await request.json();

  const parsed = parseYouTube(referenceUrl);
  if (!parsed) {
    return Response.json({ error: "Invalid YouTube URL." }, { status: 400 });
  }

  const video = await createVideo({
    videoId: parsed.videoId,
    referenceUrl,
    title: title?.trim() || "Untitled video",
    category: category?.trim() ? category.trim() : undefined,
  });

  return Response.json(video, { status: 201 });
});
