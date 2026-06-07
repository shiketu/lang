"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ListTodo, CheckCircle2, Circle } from "lucide-react";
import type { TaskWithStatus, TaskStatus } from "../domain/Task";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TodoWidget() {
  const ws = useWs();
  const dict = useDict();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const date = todayStr();

  useEffect(() => {
    apiFetch(`/todos/daily?date=${date}`)
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [date]);

  async function toggleStatus(taskId: string, current: TaskStatus) {
    const next: TaskStatus = current === "done" ? "todo" : "done";
    await apiFetch("/todos/daily", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, taskId, status: next }),
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dict.todos.widgetTitle}</h3>
        </div>
        <Link href={`/${ws}/todos`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          {dict.todos.manage}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{dict.todos.noTasks}</p>
          <Link href={`/${ws}/todos`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            {dict.todos.makePlan}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{dict.todos.progress}</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {doneCount}/{total}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {allDone && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3 text-center">
              {dict.todos.allDone}
            </p>
          )}

          <div className="space-y-2">
            {tasks.map((task) => {
              const done = task.status === "done";
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <button
                  key={task.id}
                  onClick={() => toggleStatus(task.id, task.status)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                    done
                      ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${done ? "text-emerald-500" : "text-slate-400"}`} />
                  <span
                    className={`text-sm ${
                      task.status === "done"
                        ? "line-through text-slate-400"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {task.title}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
