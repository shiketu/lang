import { NextRequest } from "next/server";
import {
  getTargetWithAttempts,
  deleteTarget,
} from "@/features/shadowing/application/service";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async (
  _request: NextRequest,
  { params }: { params: Promise<{ ws: string; id: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const result = await getTargetWithAttempts(id);
  if (!result) return new Response("Not found", { status: 404 });
  return Response.json(result);
});

export const DELETE = withWorkspaceRoute(async (
  _request: NextRequest,
  { params }: { params: Promise<{ ws: string; id: string }> }
) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = await deleteTarget(id);
  if (!ok) return new Response("Not found", { status: 404 });
  return Response.json({ success: true });
});
