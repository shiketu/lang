"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskSchedule, TaskWithStatus, TaskStatus } from "../domain/Task";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const STATUS_DISPLAY: Record<TaskStatus, { icon: string; label: string; color: string }> = {
  todo: { icon: "○", label: "未着手", color: "text-gray-400" },
  in_progress: { icon: "◐", label: "進行中", color: "text-yellow-500" },
  done: { icon: "✓", label: "完了", color: "text-green-500" },
};

const STATUS_CYCLE: TaskStatus[] = ["todo", "in_progress", "done"];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return formatLocalDate(new Date());
}

function scheduleLabel(schedule: TaskSchedule): string {
  if (schedule.type === "daily") return "毎日";
  return "毎週 " + schedule.days.map((d) => DAY_LABELS[d]).join("・");
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<TaskWithStatus[]>([]);
  const [date] = useState(todayStr);

  // New task form
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly">("daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editScheduleType, setEditScheduleType] = useState<"daily" | "weekly">("daily");
  const [editWeeklyDays, setEditWeeklyDays] = useState<number[]>([]);

  const loadTasks = useCallback(async () => {
    const [allRes, dailyRes] = await Promise.all([
      fetch("/api/todos"),
      fetch(`/api/todos/daily?date=${date}`),
    ]);
    if (allRes.ok) setTasks(await allRes.json());
    if (dailyRes.ok) setDailyTasks(await dailyRes.json());
  }, [date]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const schedule: TaskSchedule =
      scheduleType === "daily"
        ? { type: "daily" }
        : { type: "weekly", days: weeklyDays.sort() };

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), schedule }),
    });
    setTitle("");
    setWeeklyDays([]);
    loadTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("このタスクを削除しますか？")) return;
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    loadTasks();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditScheduleType(task.schedule.type);
    setEditWeeklyDays(
      task.schedule.type === "weekly" ? [...task.schedule.days] : []
    );
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    const schedule: TaskSchedule =
      editScheduleType === "daily"
        ? { type: "daily" }
        : { type: "weekly", days: editWeeklyDays.sort() };

    await fetch(`/api/todos/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), schedule }),
    });
    setEditingId(null);
    loadTasks();
  }

  async function cycleStatus(taskId: string, current: TaskStatus) {
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await fetch("/api/todos/daily", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, taskId, status: next }),
    });
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: next } : t))
    );
  }

  function toggleDay(day: number, days: number[], setDays: (d: number[]) => void) {
    setDays(
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  }

  const doneCount = dailyTasks.filter((t) => t.status === "done").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Today's checklist */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">今日のタスク</h2>
          {dailyTasks.length > 0 && (
            <span className="text-sm text-gray-500">
              {doneCount}/{dailyTasks.length} 完了
            </span>
          )}
        </div>

        {dailyTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">
            今日のタスクはありません。右側でタスクを追加してください。
          </p>
        ) : (
          <div className="space-y-2">
            {dailyTasks.map((task) => {
              const display = STATUS_DISPLAY[task.status];
              return (
                <button
                  key={task.id}
                  onClick={() => cycleStatus(task.id, task.status)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border rounded-lg transition-colors ${
                    task.status === "done"
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  <span className={`text-xl ${display.color}`}>
                    {display.icon}
                  </span>
                  <span
                    className={
                      task.status === "done"
                        ? "line-through text-gray-400"
                        : ""
                    }
                  >
                    {task.title}
                  </span>
                  <span className={`ml-auto text-xs ${display.color}`}>
                    {display.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Task management */}
      <div>
        <h2 className="text-lg font-bold mb-4">タスク管理</h2>

        {/* Create form */}
        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスク..."
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
          <div className="flex gap-2 items-center">
            <select
              value={scheduleType}
              onChange={(e) =>
                setScheduleType(e.target.value as "daily" | "weekly")
              }
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
            </select>
            {scheduleType === "weekly" && (
              <div className="flex gap-1">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i, weeklyDays, setWeeklyDays)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      weeklyDays.includes(i)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={
              !title.trim() ||
              (scheduleType === "weekly" && weeklyDays.length === 0)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
        </form>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((task) =>
            editingId === task.id ? (
              <div
                key={task.id}
                className="border rounded-lg p-3 space-y-2 dark:border-gray-700"
              >
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={editScheduleType}
                    onChange={(e) =>
                      setEditScheduleType(
                        e.target.value as "daily" | "weekly"
                      )
                    }
                    className="border rounded-md px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                  </select>
                  {editScheduleType === "weekly" && (
                    <div className="flex gap-1">
                      {DAY_LABELS.map((label, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            toggleDay(i, editWeeklyDays, setEditWeeklyDays)
                          }
                          className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                            editWeeklyDays.includes(i)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={task.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {scheduleLabel(task.schedule)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
