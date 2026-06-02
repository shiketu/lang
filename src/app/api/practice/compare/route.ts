import { NextRequest } from "next/server";
import { compareExpressions } from "@/features/practice/application/service";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { original, userInput, meaning, context } = await request.json();

  if (!original || !userInput || !meaning) {
    return Response.json(
      { error: "original, userInput, and meaning are required" },
      { status: 400 }
    );
  }

  const analysis = await compareExpressions(original, userInput, meaning, context);
  return Response.json({ analysis });
}
