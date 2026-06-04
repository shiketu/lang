"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Pencil, Trash2, Plus } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Task, TaskSchedule, TaskWithStatus, TaskStatus } from "../domain/Task";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  async function confirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/todos/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
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

  async function toggleStatus(taskId: string, current: TaskStatus) {
    const next: TaskStatus = current === "done" ? "todo" : "done";
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
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            今日のタスク
          </h2>
          {dailyTasks.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {doneCount}/{dailyTasks.length} 完了
            </span>
          )}
        </div>

        {dailyTasks.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            今日のタスクはありません。右側でタスクを追加してください。
          </p>
        ) : (
          <div className="space-y-2">
            {dailyTasks.map((task) => {
              const done = task.status === "done";
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <button
                  key={task.id}
                  onClick={() => toggleStatus(task.id, task.status)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    done
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/10"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      done ? "text-emerald-500" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={
                      done
                        ? "line-through text-slate-400"
                        : "text-slate-700 dark:text-slate-200"
                    }
                  >
                    {task.title}
                  </span>
                  <span
                    className={`ml-auto text-xs ${
                      done ? "text-emerald-500" : "text-slate-400"
                    }`}
                  >
                    {done ? "完了" : "未完成"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Task management */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
          タスク管理
        </h2>

        {/* Create form */}
        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスク..."
            className="field"
          />
          <div className="flex gap-2 items-center">
            <select
              value={scheduleType}
              onChange={(e) =>
                setScheduleType(e.target.value as "daily" | "weekly")
              }
              className="field w-auto"
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
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
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
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </form>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((task) =>
            editingId === task.id ? (
              <div key={task.id} className="card p-3 space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="field"
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={editScheduleType}
                    onChange={(e) =>
                      setEditScheduleType(e.target.value as "daily" | "weekly")
                    }
                    className="field w-auto text-sm"
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
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary">
                    保存
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={task.id}
                className="card flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {scheduleLabel(task.schedule)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(task)}
                    aria-label="編集"
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(task.id)}
                    aria-label="削除"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="このタスクを削除しますか？"
        message="この操作は取り消せません。"
        confirmLabel="削除する"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
