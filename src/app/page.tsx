"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Database,
  BookOpen,
  Edit3,
  Video,
  ListTodo,
  Target,
  type LucideIcon,
} from "lucide-react";
import TodoWidget from "@/features/todos/components/TodoWidget";

interface Feature {
  id: string;
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  tile: string; // soft bg + text color
}

const FEATURES: Feature[] = [
  { id: "lakehouse", href: "/lakehouse", title: "言語データ", desc: "単語・表現・例文を管理", icon: Database, tile: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  { id: "notes", href: "/notes", title: "毎日ノート", desc: "毎日の表現や気づきを記録", icon: BookOpen, tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  { id: "practice", href: "/practice", title: "表現練習", desc: "表現力を鍛える", icon: Edit3, tile: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
  { id: "video", href: "/video", title: "録画練習", desc: "発話を録画して確認", icon: Video, tile: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" },
  { id: "todos", href: "/todos", title: "学習計画", desc: "タスクと進捗を管理", icon: ListTodo, tile: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "おはようございます";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [taskStat, setTaskStat] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((d) => setEntryCount(Array.isArray(d) ? d.length : 0))
      .catch(() => setEntryCount(0));
    fetch(`/api/todos/daily?date=${todayStr()}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setTaskStat({ done: d.filter((t) => t.status === "done").length, total: d.length });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            ダッシュボード
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {greeting()}！今日も目標に向けて頑張りましょう。
          </p>
        </div>
        <div className="flex gap-3">
          <StatChip
            icon={Database}
            tile="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
            label="登録済み表現"
            value={entryCount === null ? "…" : `${entryCount} 件`}
          />
          <StatChip
            icon={Target}
            tile="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            label="今日のタスク"
            value={taskStat ? `${taskStat.done}/${taskStat.total}` : "—"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: feature grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Link href={f.href} className="card card-interactive p-6 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.tile}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {f.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right: today's tasks */}
        <div className="space-y-6">
          <TodoWidget />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  tile,
  label,
  value,
}: {
  icon: LucideIcon;
  tile: string;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card p-3 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tile}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </motion.div>
  );
}
