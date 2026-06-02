import { NextRequest } from "next/server";
import { extractEntriesFromNote } from "@/features/notes/application/extract";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date } = await params;
  const candidates = await extractEntriesFromNote(date);
  return Response.json(candidates);
}
