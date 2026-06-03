import { NextRequest } from "next/server";
import {
  getRecordingBlob,
  getRecordingSignedUrl,
} from "@/features/recordings/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  // Prefer a presigned URL (S3): the browser fetches directly from the CDN,
  // supporting range requests / seeking and offloading bandwidth.
  const signedUrl = await getRecordingSignedUrl(id);
  if (signedUrl) {
    return Response.redirect(signedUrl, 307);
  }

  // Fallback (local disk): stream the blob through the server.
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
