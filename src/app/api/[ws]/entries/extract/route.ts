import { NextRequest } from "next/server";
import { extractEntriesFromText } from "@/features/entries/application/extract";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

// Extracts entry candidates from pasted/uploaded text (no note required).
// Import happens separately via POST /entries/bulk.
const MAX_CHARS = 20000;

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const content = typeof body?.content === "string" ? body.content : "";
  if (!content.trim()) {
    return Response.json({ error: "Empty content." }, { status: 400 });
  }

  const candidates = await extractEntriesFromText(content.slice(0, MAX_CHARS));
  return Response.json(candidates);
});
