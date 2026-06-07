import { getTaskRepository } from "@/composition";
import type { Task, TaskSchedule, TaskStatus, TaskWithStatus } from "../domain/Task";

export function listTasks(): Promise<Task[]> {
  return getTaskRepository().listTasks();
}

export function createTask(data: {
  title: string;
  schedule: TaskSchedule;
}): Promise<Task> {
  return getTaskRepository().createTask(data);
}

export function updateTask(
  id: string,
  data: { title?: string; schedule?: TaskSchedule }
): Promise<Task | null> {
  return getTaskRepository().updateTask(id, data);
}

export function deleteTask(id: string): Promise<boolean> {
  return getTaskRepository().deleteTask(id);
}

export function setCompletion(
  date: string,
  taskId: string,
  status: TaskStatus
): Promise<void> {
  return getTaskRepository().setCompletion(date, taskId, status);
}

export function removeCompletion(
  date: string,
  taskId: string
): Promise<void> {
  return getTaskRepository().removeCompletion(date, taskId);
}

/** Return tasks active on a specific date, with their completion status */
export async function getTasksForDate(
  date: string
): Promise<TaskWithStatus[]> {
  const [tasks, completions] = await Promise.all([
    getTaskRepository().listTasks(),
    getTaskRepository().getCompletions(date),
  ]);

  const [y, m, d] = date.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();

  return tasks
    .filter((task) => {
      if (task.schedule.type === "daily") return true;
      if (task.schedule.type === "weekly")
        return task.schedule.days.includes(dayOfWeek);
      return false;
    })
    .map((task) => ({
      ...task,
      status: completions[task.id] ?? ("todo" as TaskStatus),
    }));
}
