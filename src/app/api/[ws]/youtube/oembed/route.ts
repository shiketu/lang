import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

// Server-side proxy for YouTube's oEmbed endpoint (client fetch is blocked by
// CORS). Used to show real video titles on the shadowing "videos" view.
// Title resolution is best-effort: failures return { title: null } so the UI
// falls back to a segment title / videoId.
const cache = new Map<string, string | null>();
const VIDEO_ID = /^[\w-]{11}$/;

export const GET = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const videoId = new URL(request.url).searchParams.get("videoId") ?? "";
  if (!VIDEO_ID.test(videoId)) {
    return Response.json({ title: null });
  }
  if (cache.has(videoId)) {
    return Response.json({ title: cache.get(videoId) ?? null });
  }

  let title: string | null = null;
  try {
    const watch = `https://www.youtube.com/watch?v=${videoId}`;
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      title = typeof data.title === "string" ? data.title : null;
    }
  } catch {
    title = null;
  }

  cache.set(videoId, title);
  return Response.json(
    { title },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
});
