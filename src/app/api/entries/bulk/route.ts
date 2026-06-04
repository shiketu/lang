import { NextRequest } from "next/server";
import { createEntry } from "@/features/entries/application/service";
import type { ExtractedEntry } from "@/features/notes/domain/ExtractedEntry";
import { enqueueReview } from "@/features/review/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
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

  // Imported expressions enter the recall queue; count the batch as captures.
  if (created.length > 0) {
    const today = todayInTokyo();
    try {
      const tomorrow = addDays(today, 1);
      for (const e of created) await enqueueReview("entry", e.id, tomorrow);
      await logActivity(today, "capture", created.length);
    } catch {}
  }

  return Response.json({ count: created.length, entries: created }, { status: 201 });
}
