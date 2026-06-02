import { NextRequest } from "next/server";
import { listTasks, createTask } from "@/features/todos/application/service";

export async function GET() {
  const tasks = await listTasks();
  return Response.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.title || !body.schedule) {
    return Response.json(
      { error: "title and schedule are required" },
      { status: 400 }
    );
  }
  const task = await createTask(body);
  return Response.json(task, { status: 201 });
}
