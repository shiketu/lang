import { NextRequest } from "next/server";
import { listTasks, createTask } from "@/features/todos/application/service";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const tasks = await listTasks();
  return Response.json(tasks);
});

export const POST = withWorkspaceRoute(async (request: NextRequest) => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!body.title || !body.schedule) {
    return Response.json(
      { error: "title and schedule are required" },
      { status: 400 }
    );
  }
  const task = await createTask(body);
  return Response.json(task, { status: 201 });
});
