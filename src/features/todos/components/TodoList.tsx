"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Pencil, Trash2, Plus } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Task, TaskSchedule, TaskWithStatus, TaskStatus } from "../domain/Task";

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return formatLocalDate(new Date());
}

export default function TodoList() {
  const dict = useDict();
  const DAY_LABELS = dict.todos.dayLabels;

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

  function scheduleLabel(schedule: TaskSchedule): string {
    if (schedule.type === "daily") return dict.todos.daily;
    return dict.todos.weeklyPrefix + schedule.days.map((d) => DAY_LABELS[d]).join(", ");
  }

  const loadTasks = useCallback(async () => {
    const [allRes, dailyRes] = await Promise.all([
      apiFetch("/todos"),
      apiFetch(`/todos/daily?date=${date}`),
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

    await apiFetch("/todos", {
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
    await apiFetch(`/todos/${deleteId}`, { method: "DELETE" });
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

    await apiFetch(`/todos/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), schedule }),
    });
    setEditingId(null);
    loadTasks();
  }

  async function toggleStatus(taskId: string, current: TaskStatus) {
    const next: TaskStatus = current === "done" ? "todo" : "done";
    await apiFetch("/todos/daily", {
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
            {dict.todos.todayHeading}
          </h2>
          {dailyTasks.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {fmt(dict.todos.progressDone, { done: doneCount, total: dailyTasks.length })}
            </span>
          )}
        </div>

        {dailyTasks.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {dict.todos.noTasksToday}
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
                    {done ? dict.todos.complete : dict.todos.incomplete}
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
          {dict.todos.management}
        </h2>

        {/* Create form */}
        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.todos.newTaskPlaceholder}
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
              <option value="daily">{dict.todos.daily}</option>
              <option value="weekly">{dict.todos.weekly}</option>
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
            {dict.todos.add}
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
                    <option value="daily">{dict.todos.daily}</option>
                    <option value="weekly">{dict.todos.weekly}</option>
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
                    {dict.todos.save}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost">
                    {dict.todos.cancel}
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
                    aria-label={dict.todos.edit}
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(task.id)}
                    aria-label={dict.common.deleteAction}
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
        title={dict.todos.deleteConfirmTitle}
        message={dict.common.irreversible}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
