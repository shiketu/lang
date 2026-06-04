"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Play, CheckCircle2, Flame } from "lucide-react";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { ROUTINE_STEPS, dailyTheme, type RoutineStep } from "@/features/activity/routine";
import { dayTotals, currentStreak } from "@/lib/streak";
import { todayInTokyo } from "@/lib/today";
import type { ActivityLog } from "@/features/activity/domain/Activity";

function stepMetric(step: RoutineStep, today: string, dueCount: number, done: boolean): string {
  switch (step.id) {
    case "review":
      return dueCount > 0 ? `${dueCount}件の復習` : "復習なし";
    case "shadowing":
      return "お手本と比較練習";
    case "selftalk":
      return `テーマ: ${dailyTheme(today)}`;
    case "notes":
      return done ? "記録済み" : "未記録";
    default:
      return "";
  }
}

export default function HomePage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [reviewLoaded, setReviewLoaded] = useState(false);
  const today = todayInTokyo();

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setLogs([]));
    fetch("/api/review")
      .then((r) => r.json())
      .then((d) => setDueCount(Array.isArray(d) ? d.length : 0))
      .catch(() => setDueCount(0))
      .finally(() => setReviewLoaded(true));
  }, []);

  const totals = dayTotals(logs);
  const streak = currentStreak(new Set(totals.keys()), today);

  const todaysKinds = new Set(
    logs.filter((l) => l.date === today && l.count > 0).map((l) => l.kind)
  );
  const steps = ROUTINE_STEPS.map((s) => ({
    step: s,
    // Review is "done" once you've graded something today, or when nothing is due.
    done:
      s.id === "review"
        ? todaysKinds.has("review") || (reviewLoaded && dueCount === 0)
        : s.doneKinds.some((k) => todaysKinds.has(k)),
  }));
  const doneCount = steps.filter((s) => s.done).length;
  const activeIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header: consistency over welcome */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
          <Flame className="w-3.5 h-3.5" />
          {streak > 0 ? `${streak}日連続学習中` : "今日から始めましょう"}
        </span>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          今日も言語回路を鍛えましょう
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          反復と継続が、一番の近道です。今日のルーティンを始めましょう。
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: the daily flow */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600 fill-current" />
              今日のルーティン
            </h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              完了: {doneCount}/{steps.length}
            </span>
          </div>

          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800 z-0 hidden sm:block" />

            {steps.map(({ step, done }, index) => {
              const isActive = index === activeIndex;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-900 border-indigo-400 shadow-md ring-4 ring-indigo-50 dark:ring-indigo-950/40"
                      : done
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                  }`}
                >
                  {/* Icon / status */}
                  <div className="flex items-center sm:items-start shrink-0">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                        done ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : step.accent
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3
                        className={`text-lg font-bold ${
                          done ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md self-start sm:self-auto shrink-0">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{step.desc}</p>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full truncate">
                        {stepMetric(step, today, dueCount, done)}
                      </span>

                      {done ? (
                        <span className="px-4 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-medium text-sm bg-emerald-50 dark:bg-emerald-950/40 shrink-0">
                          完了済
                        </span>
                      ) : isActive ? (
                        <Link
                          href={step.href}
                          className={`px-4 py-2 rounded-xl text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 ${step.btn}`}
                        >
                          <Play className="w-4 h-4 fill-current" /> 開始する
                        </Link>
                      ) : (
                        <Link
                          href={step.href}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                        >
                          始める
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: consistency */}
        <div className="space-y-6">
          <ActivityHeatmap logs={logs} today={today} />
        </div>
      </div>
    </div>
  );
}
