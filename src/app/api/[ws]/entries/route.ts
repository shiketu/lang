import { NextRequest } from "next/server";
import { listEntries, createEntry } from "@/features/entries/application/service";
import type { EntryType, Purpose, Register } from "@/features/entries/domain/Entry";
import { enqueueReview } from "@/features/review/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as EntryType | null;
  const purpose = searchParams.get("purpose") as Purpose | null;
  const register = searchParams.get("register") as Register | null;
  const query = searchParams.get("q");
  const tag = searchParams.get("tag");

  const entries = await listEntries({
    type: type ?? undefined,
    purpose: purpose ?? undefined,
    register: register ?? undefined,
    tag: tag ?? undefined,
    query: query ?? undefined,
  });

  return Response.json(entries);
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const entry = await createEntry(body);

  // New expressions enter the recall review queue and count as a daily capture.
  const today = todayInTokyo();
  try {
    await enqueueReview("entry", entry.id, addDays(today, 1));
    await logActivity(today, "capture");
  } catch {}

  return Response.json(entry, { status: 201 });
});
