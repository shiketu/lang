import { NextRequest } from "next/server";
import {
  getTasksForDate,
  setCompletion,
  removeCompletion,
} from "@/features/todos/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return Response.json({ error: "date is required" }, { status: 400 });
  }
  const tasks = await getTasksForDate(date);
  return Response.json(tasks);
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { date, taskId, status } = await request.json();
  if (!date || !taskId || !status) {
    return Response.json(
      { error: "date, taskId, and status are required" },
      { status: 400 }
    );
  }
  if (status === "todo") {
    await removeCompletion(date, taskId);
  } else {
    await setCompletion(date, taskId, status);
  }
  return Response.json({ success: true });
}
