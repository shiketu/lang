import { NextRequest } from "next/server";
import { listTargets, createTarget } from "@/features/shadowing/application/service";
import { parseYouTube } from "@/lib/youtube";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const targets = await listTargets();
  return Response.json(targets);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { referenceUrl, title, segmentStart, segmentEnd, category } =
    await request.json();

  const parsed = parseYouTube(referenceUrl);
  if (!parsed) {
    return Response.json(
      { error: "有効な YouTube URL を入力してください。" },
      { status: 400 }
    );
  }
  if (
    typeof segmentStart !== "number" ||
    typeof segmentEnd !== "number" ||
    segmentEnd <= segmentStart
  ) {
    return Response.json(
      { error: "区間（開始・終了）が正しくありません。" },
      { status: 400 }
    );
  }

  const target = await createTarget({
    referenceUrl,
    videoId: parsed.videoId,
    title: title?.trim() || "無題のクリップ",
    segmentStart,
    segmentEnd,
    category: category?.trim() ? category.trim() : undefined,
  });

  return Response.json(target, { status: 201 });
}
