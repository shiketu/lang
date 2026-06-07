import { NextRequest } from "next/server";
import { compareExpressions } from "@/features/practice/application/service";
import { enqueueReview } from "@/features/review/application/service";
import { logActivity } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { original, userInput, meaning, context, entryId } = await request.json();

  if (!original || !userInput || !meaning) {
    return Response.json(
      { error: "original, userInput, and meaning are required" },
      { status: 400 }
    );
  }

  const analysis = await compareExpressions(original, userInput, meaning, context);

  // A practice round schedules the expression for production-mode review.
  const today = todayInTokyo();
  try {
    if (entryId) await enqueueReview("practice", entryId, addDays(today, 1));
    await logActivity(today, "practice");
  } catch {}

  return Response.json({ analysis });
});
