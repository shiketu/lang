import { NextRequest } from "next/server";
import { getActivityRange } from "@/features/activity/application/service";
import { todayInTokyo, addDays } from "@/lib/today";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const today = todayInTokyo();
  const { searchParams } = request.nextUrl;
  // Default window: ~14 weeks back through today.
  const to = searchParams.get("to") ?? today;
  const from = searchParams.get("from") ?? addDays(today, -14 * 7);

  const logs = await getActivityRange(from, to);
  return Response.json(logs);
}
