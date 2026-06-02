import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { tasks, taskCompletions } from "@/lib/db/schema";
import type { Task, TaskSchedule, TaskStatus } from "../domain/Task";
import type { TaskRepository } from "../domain/TaskRepository";

type Row = typeof tasks.$inferSelect;

function toTask(row: Row): Task {
  return {
    id: row.id,
    title: row.title,
    schedule: row.schedule,
    created: row.created,
  };
}

export class PostgresTaskRepository implements TaskRepository {
  async listTasks(): Promise<Task[]> {
    const db = getDb();
    const rows = await db.select().from(tasks);
    return rows.map(toTask);
  }

  async createTask(data: {
    title: string;
    schedule: TaskSchedule;
  }): Promise<Task> {
    const db = getDb();
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      schedule: data.schedule,
      created: new Date().toISOString(),
    };
    await db.insert(tasks).values({
      id: task.id,
      title: task.title,
      schedule: task.schedule,
      created: task.created,
    });
    return task;
  }

  async updateTask(
    id: string,
    data: { title?: string; schedule?: TaskSchedule }
  ): Promise<Task | null> {
    const db = getDb();
    const set: Partial<Row> = {};
    if (data.title !== undefined) set.title = data.title;
    if (data.schedule !== undefined) set.schedule = data.schedule;

    if (Object.keys(set).length === 0) {
      const rows = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);
      return rows[0] ? toTask(rows[0]) : null;
    }

    const rows = await db
      .update(tasks)
      .set(set)
      .where(eq(tasks.id, id))
      .returning();
    return rows[0] ? toTask(rows[0]) : null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = getDb();
    await db.delete(taskCompletions).where(eq(taskCompletions.taskId, id));
    const res = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    return res.length > 0;
  }

  async getCompletions(date: string): Promise<Record<string, TaskStatus>> {
    const db = getDb();
    const rows = await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.date, date));
    const result: Record<string, TaskStatus> = {};
    for (const r of rows) result[r.taskId] = r.status;
    return result;
  }

  async setCompletion(
    date: string,
    taskId: string,
    status: TaskStatus
  ): Promise<void> {
    const db = getDb();
    await db
      .insert(taskCompletions)
      .values({ date, taskId, status })
      .onConflictDoUpdate({
        target: [taskCompletions.date, taskCompletions.taskId],
        set: { status },
      });
  }

  async removeCompletion(date: string, taskId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(taskCompletions)
      .where(
        and(eq(taskCompletions.date, date), eq(taskCompletions.taskId, taskId))
      );
  }
}
