import { taskRepository } from "@/composition";
import type { Task, TaskSchedule, TaskStatus, TaskWithStatus } from "../domain/Task";

export function listTasks(): Promise<Task[]> {
  return taskRepository.listTasks();
}

export function createTask(data: {
  title: string;
  schedule: TaskSchedule;
}): Promise<Task> {
  return taskRepository.createTask(data);
}

export function updateTask(
  id: string,
  data: { title?: string; schedule?: TaskSchedule }
): Promise<Task | null> {
  return taskRepository.updateTask(id, data);
}

export function deleteTask(id: string): Promise<boolean> {
  return taskRepository.deleteTask(id);
}

export function setCompletion(
  date: string,
  taskId: string,
  status: TaskStatus
): Promise<void> {
  return taskRepository.setCompletion(date, taskId, status);
}

export function removeCompletion(
  date: string,
  taskId: string
): Promise<void> {
  return taskRepository.removeCompletion(date, taskId);
}

/** Return tasks active on a specific date, with their completion status */
export async function getTasksForDate(
  date: string
): Promise<TaskWithStatus[]> {
  const [tasks, completions] = await Promise.all([
    taskRepository.listTasks(),
    taskRepository.getCompletions(date),
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
