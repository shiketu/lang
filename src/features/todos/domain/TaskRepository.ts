import type { Task, TaskSchedule, TaskStatus } from "./Task";

export interface TaskRepository {
  listTasks(): Promise<Task[]>;
  createTask(data: { title: string; schedule: TaskSchedule }): Promise<Task>;
  updateTask(
    id: string,
    data: { title?: string; schedule?: TaskSchedule }
  ): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;

  getCompletions(date: string): Promise<Record<string, TaskStatus>>;
  setCompletion(
    date: string,
    taskId: string,
    status: TaskStatus
  ): Promise<void>;
  removeCompletion(date: string, taskId: string): Promise<void>;
}
