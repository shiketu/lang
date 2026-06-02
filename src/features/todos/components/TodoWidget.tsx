"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TaskWithStatus, TaskStatus } from "../domain/Task";

const STATUS_ICON: Record<TaskStatus, string> = {
  todo: "○",
  in_progress: "◐",
  done: "✓",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "text-gray-400",
  in_progress: "text-yellow-500",
  done: "text-green-500",
};

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TodoWidget() {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const date = todayStr();

  useEffect(() => {
    fetch(`/api/todos/daily?date=${date}`)
      .then((r) => r.json())
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [date]);

  async function cycleStatus(taskId: string, current: TaskStatus) {
    const cycle: TaskStatus[] = ["todo", "in_progress", "done"];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    await fetch("/api/todos/daily", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, taskId, status: next }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: next } : t))
    );
  }

  if (loading) return null;
  if (tasks.length === 0) return null;

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">今日のタスク</h3>
        <Link
          href="/todos"
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          管理 →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {doneCount}/{total}
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => cycleStatus(task.id, task.status)}
            className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className={`text-sm ${STATUS_COLOR[task.status]}`}>
              {STATUS_ICON[task.status]}
            </span>
            <span
              className={`text-sm ${
                task.status === "done"
                  ? "line-through text-gray-400"
                  : ""
              }`}
            >
              {task.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
