import { NextRequest } from "next/server";
import { saveTranscript } from "@/features/study/application/videoService";
import type { TranscriptLine } from "@/features/study/domain/Video";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

type Ctx = { params: Promise<{ ws: string; id: string }> };

// The client parses pasted captions and PUTs the normalized lines here.
export const PUT = withWorkspaceRoute(async (request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const raw = Array.isArray(body?.transcript) ? body.transcript : null;
  if (!raw) {
    return Response.json({ error: "transcript array required" }, { status: 400 });
  }

  const lines: TranscriptLine[] = raw
    .filter(
      (l: unknown): l is TranscriptLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as TranscriptLine).t === "number" &&
        typeof (l as TranscriptLine).text === "string"
    )
    .map((l: TranscriptLine) => ({ t: l.t, text: l.text }));

  const video = await saveTranscript(id, lines);
  if (!video) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(video);
});
