import { NextRequest } from "next/server";
import { createEntry } from "@/features/entries/application/service";
import type { ExtractedEntry } from "@/features/notes/domain/ExtractedEntry";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const items: ExtractedEntry[] = Array.isArray(body.entries) ? body.entries : [];

  const created = [];
  for (const item of items) {
    if (!item?.japanese) continue;
    const entry = await createEntry({
      type: item.type,
      japanese: item.japanese,
      reading: item.reading,
      meaning: item.meaning,
      tags: item.tags ?? [],
      content: "",
    });
    created.push(entry);
  }

  return Response.json({ count: created.length, entries: created }, { status: 201 });
}
