import { NextRequest } from "next/server";
import { getEntry, updateEntry, deleteEntry } from "@/features/entries/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(entry);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const entry = await updateEntry(id, body);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(entry);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = await deleteEntry(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
