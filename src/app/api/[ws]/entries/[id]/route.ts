import { NextRequest } from "next/server";
import { getEntry, updateEntry, deleteEntry } from "@/features/entries/application/service";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async (
  _request: NextRequest,
  { params }: { params: Promise<{ ws: string; id: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(entry);
});

export const PUT = withWorkspaceRoute(async (
  request: NextRequest,
  { params }: { params: Promise<{ ws: string; id: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const entry = await updateEntry(id, body);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(entry);
});

export const DELETE = withWorkspaceRoute(async (
  _request: NextRequest,
  { params }: { params: Promise<{ ws: string; id: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = await deleteEntry(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
});
