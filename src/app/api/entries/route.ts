import { NextRequest } from "next/server";
import { listEntries, createEntry } from "@/features/entries/application/service";
import type { EntryType } from "@/features/entries/domain/Entry";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as EntryType | null;
  const query = searchParams.get("q");
  const tag = searchParams.get("tag");

  const entries = await listEntries({
    type: type ?? undefined,
    tag: tag ?? undefined,
    query: query ?? undefined,
  });

  return Response.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entry = await createEntry(body);
  return Response.json(entry, { status: 201 });
}
