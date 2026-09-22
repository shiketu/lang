import { NextRequest } from "next/server";
import {
  getClipWithAttempts,
  deleteClip,
} from "@/features/study/application/clipService";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

type Ctx = { params: Promise<{ ws: string; id: string }> };

export const GET = withWorkspaceRoute(async (_request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const data = await getClipWithAttempts(id);
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
});

export const DELETE = withWorkspaceRoute(async (_request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = await deleteClip(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
});
