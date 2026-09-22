"use client";

import { useEffect, useState, useMemo } from "react";
import { Layers, BookOpen, Film, Scissors, Video, BrainCircuit } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import type { ActivityLog } from "@/features/activity/domain/Activity";

interface Totals {
  entries: number;
  videos: number;
  clips: number;
  recordings: number;
  reviews: number;
}

interface StatsResponse {
  totals: Totals;
  series: ActivityLog[];
}

/** Cumulative totals per day for one activity kind, oldest → newest. */
function cumulative(series: ActivityLog[], kind: string) {
  const byDate = new Map<string, number>();
  for (const l of series) {
    if (l.kind !== kind) continue;
    byDate.set(l.date, (byDate.get(l.date) ?? 0) + l.count);
  }
  const dates = [...byDate.keys()].sort();
  let running = 0;
  return dates.map((d) => {
    running += byDate.get(d) ?? 0;
    return { date: d, value: running };
  });
}

function Spark({
  points,
  max,
  fill,
}: {
  points: { date: string; value: number }[];
  max: number;
  fill: boolean;
}) {
  if (points.length < 2 || max <= 0) return null;
  const W = 100;
  const H = 34;
  const step = W / (points.length - 1);
  const coords = points.map((p, i) => [i * step, H - (p.value / max) * H] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <>
      {fill && <path d={area} fill="currentColor" opacity="0.12" />}
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </>
  );
}

export default function StudyStats() {
  const dict = useDict();
  const [data, setData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    apiFetch("/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const captures = useMemo(() => cumulative(data?.series ?? [], "capture"), [data]);
  const reviews = useMemo(() => cumulative(data?.series ?? [], "review"), [data]);

  const t = data?.totals;
  const tiles = [
    { icon: BookOpen, label: dict.stats.entries, value: t?.entries, tone: "text-indigo-600 dark:text-indigo-400" },
    { icon: Film, label: dict.stats.videos, value: t?.videos, tone: "text-violet-600 dark:text-violet-400" },
    { icon: Scissors, label: dict.stats.clips, value: t?.clips, tone: "text-cyan-600 dark:text-cyan-400" },
    { icon: Video, label: dict.stats.recordings, value: t?.recordings, tone: "text-rose-600 dark:text-rose-400" },
    { icon: BrainCircuit, label: dict.stats.reviews, value: t?.reviews, tone: "text-emerald-600 dark:text-emerald-400" },
  ];

  const maxCapture = captures.length ? captures[captures.length - 1].value : 0;
  const maxReview = reviews.length ? reviews[reviews.length - 1].value : 0;

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {dict.stats.title}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {tiles.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Icon className={`w-3.5 h-3.5 ${tone}`} />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Growth curves: how the library and the review load built up over time */}
      <div className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {dict.stats.captureCurve}
            </span>
            <span className="text-xs tabular-nums text-slate-400">{maxCapture}</span>
          </div>
          <div className="text-indigo-500 dark:text-indigo-400">
            <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="w-full h-9 block">
              <Spark points={captures} max={maxCapture} fill />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {dict.stats.reviewCurve}
            </span>
            <span className="text-xs tabular-nums text-slate-400">{maxReview}</span>
          </div>
          <div className="text-emerald-500 dark:text-emerald-400">
            <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="w-full h-9 block">
              <Spark points={reviews} max={maxReview} fill />
            </svg>
          </div>
        </div>
      </div>

      {captures.length < 2 && reviews.length < 2 && (
        <p className="text-xs text-slate-400 mt-3">{dict.stats.empty}</p>
      )}
    </div>
  );
}
