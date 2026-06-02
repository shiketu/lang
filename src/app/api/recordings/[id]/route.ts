import { NextRequest } from "next/server";
import { getRecordingBlob } from "@/features/recordings/application/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getRecordingBlob(id);

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(result.data), {
    headers: {
      "Content-Type": result.contentType,
      "Content-Length": result.data.length.toString(),
    },
  });
}
