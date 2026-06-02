import { NextRequest } from "next/server";
import { listRecordings, saveRecording } from "@/features/recordings/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const recordings = await listRecordings();
  return Response.json(recordings);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const topic = formData.get("topic") as string | null;
  const tagsRaw = formData.get("tags") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const meta = await saveRecording(file, {
    topic: topic ?? undefined,
    tags: tagsRaw ? JSON.parse(tagsRaw) : [],
  });

  return Response.json(meta, { status: 201 });
}
