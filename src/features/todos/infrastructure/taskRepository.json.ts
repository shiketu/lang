import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Task, TaskSchedule, TaskStatus } from "../domain/Task";
import type { TaskRepository } from "../domain/TaskRepository";

interface StoreData {
  tasks: Task[];
  completions: Record<string, Record<string, TaskStatus>>;
}

export class JsonTaskRepository implements TaskRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return {
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        completions:
          data.completions && typeof data.completions === "object"
            ? data.completions
            : {},
      };
    } catch {
      return { tasks: [], completions: {} };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(
      this.filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }

  async listTasks(): Promise<Task[]> {
    const data = await this.read();
    return data.tasks;
  }

  async createTask(input: {
    title: string;
    schedule: TaskSchedule;
  }): Promise<Task> {
    const data = await this.read();
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      schedule: input.schedule,
      created: new Date().toISOString(),
    };
    data.tasks.push(task);
    await this.write(data);
    return task;
  }

  async updateTask(
    id: string,
    input: { title?: string; schedule?: TaskSchedule }
  ): Promise<Task | null> {
    const data = await this.read();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx < 0) return null;

    if (input.title !== undefined) data.tasks[idx].title = input.title;
    if (input.schedule !== undefined) data.tasks[idx].schedule = input.schedule;
    await this.write(data);
    return data.tasks[idx];
  }

  async deleteTask(id: string): Promise<boolean> {
    const data = await this.read();
    const before = data.tasks.length;
    data.tasks = data.tasks.filter((t) => t.id !== id);
    if (data.tasks.length === before) return false;

    // Also clean up completions referencing this task
    for (const date of Object.keys(data.completions)) {
      delete data.completions[date][id];
      if (Object.keys(data.completions[date]).length === 0) {
        delete data.completions[date];
      }
    }

    await this.write(data);
    return true;
  }

  async getCompletions(date: string): Promise<Record<string, TaskStatus>> {
    const data = await this.read();
    return data.completions[date] ?? {};
  }

  async setCompletion(
    date: string,
    taskId: string,
    status: TaskStatus
  ): Promise<void> {
    const data = await this.read();
    if (!data.completions[date]) data.completions[date] = {};
    data.completions[date][taskId] = status;
    await this.write(data);
  }

  async removeCompletion(date: string, taskId: string): Promise<void> {
    const data = await this.read();
    if (data.completions[date]) {
      delete data.completions[date][taskId];
      if (Object.keys(data.completions[date]).length === 0) {
        delete data.completions[date];
      }
      await this.write(data);
    }
  }
}
