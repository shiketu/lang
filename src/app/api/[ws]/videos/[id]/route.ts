import { NextRequest } from "next/server";
import {
  getVideo,
  updateVideo,
  deleteVideo,
} from "@/features/study/application/videoService";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

type Ctx = { params: Promise<{ ws: string; id: string }> };

export const GET = withWorkspaceRoute(async (_request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(video);
});

export const PATCH = withWorkspaceRoute(async (request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const patch: { title?: string; category?: string } = {};
  if (typeof body.title === "string") patch.title = body.title.trim() || "Untitled video";
  if (typeof body.category === "string") patch.category = body.category.trim();

  const video = await updateVideo(id, patch);
  if (!video) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(video);
});

export const DELETE = withWorkspaceRoute(async (_request: NextRequest, { params }: Ctx) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = await deleteVideo(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
});
