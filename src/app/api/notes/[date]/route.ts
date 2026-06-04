import { NextRequest } from "next/server";
import { getNote, saveNote, deleteNote } from "@/features/notes/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo } from "@/lib/today";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date } = await params;
  const note = await getNote(date);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(note);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date } = await params;
  const body = await request.json();
  const note = await saveNote(date, body);

  try {
    await logActivity(todayInTokyo(), "note");
  } catch {}

  return Response.json(note);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date } = await params;
  const ok = await deleteNote(date);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
