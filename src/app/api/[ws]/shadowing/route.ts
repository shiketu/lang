import { NextRequest } from "next/server";
import { listTargets, createTarget } from "@/features/shadowing/application/service";
import { parseYouTube } from "@/lib/youtube";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const targets = await listTargets();
  return Response.json(targets);
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { referenceUrl, title, segmentStart, segmentEnd, category } =
    await request.json();

  const parsed = parseYouTube(referenceUrl);
  if (!parsed) {
    return Response.json(
      { error: "Invalid YouTube URL." },
      { status: 400 }
    );
  }
  if (
    typeof segmentStart !== "number" ||
    typeof segmentEnd !== "number" ||
    segmentEnd <= segmentStart
  ) {
    return Response.json(
      { error: "Invalid segment (start/end)." },
      { status: 400 }
    );
  }

  const target = await createTarget({
    referenceUrl,
    videoId: parsed.videoId,
    title: title?.trim() || "Untitled clip",
    segmentStart,
    segmentEnd,
    category: category?.trim() ? category.trim() : undefined,
  });

  return Response.json(target, { status: 201 });
});
