export type TaskSchedule =
  | { type: "daily" }
  | { type: "weekly"; days: number[] }; // 0=Sun, 1=Mon, ... 6=Sat

export type TaskStatus = "todo" | "done";

export interface Task {
  id: string;
  title: string;
  schedule: TaskSchedule;
  created: string;
}

export interface TaskWithStatus extends Task {
  status: TaskStatus;
}
