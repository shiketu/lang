import { NextRequest } from "next/server";
import { extractEntriesFromNote } from "@/features/notes/application/extract";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const POST = withWorkspaceRoute(async (
  _request: NextRequest,
  { params }: { params: Promise<{ ws: string; date: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date } = await params;
  const candidates = await extractEntriesFromNote(date);
  return Response.json(candidates);
});
