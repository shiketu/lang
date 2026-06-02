import { NextRequest } from "next/server";
import { extractEntriesFromNote } from "@/features/notes/application/extract";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const candidates = await extractEntriesFromNote(date);
  return Response.json(candidates);
}
