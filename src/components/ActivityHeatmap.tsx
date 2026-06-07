"use client";

import { CalendarDays } from "lucide-react";
import { useDict, useWs } from "@/i18n/I18nProvider";
import { dayTotals, buildCalendar } from "@/lib/streak";
import type { ActivityLog } from "@/features/activity/domain/Activity";

const LEVELS = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-orange-200 dark:bg-orange-900/60",
  "bg-orange-300 dark:bg-orange-700",
  "bg-orange-400 dark:bg-orange-600",
  "bg-orange-500 dark:bg-orange-500",
];

const CELL = 16; // w-3 (12px) + gap-1 (4px)

export default function ActivityHeatmap({
  logs,
  today,
  weeks = 14,
}: {
  logs: ActivityLog[];
  today: string;
  weeks?: number;
}) {
  const dict = useDict();
  const ws = useWs();
  const monthName = (month: number) =>
    new Date(2021, month, 1).toLocaleDateString(ws === "en" ? "en-US" : "ja-JP", {
      month: "short",
    });
  const totals = dayTotals(logs);
  const { columns, monthLabels } = buildCalendar(totals, today, weeks);

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-orange-500" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{dict.heatmap.title}</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="relative h-4 mb-1" style={{ width: columns.length * CELL }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.col}-${m.month}`}
                className="absolute text-[10px] text-slate-400"
                style={{ left: m.col * CELL }}
              >
                {monthName(m.month)}
              </span>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex gap-1">
            {columns.map((week, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                {week.map((cell, ri) =>
                  cell ? (
                    <div
                      key={ri}
                      className={`w-3 h-3 rounded-sm ${LEVELS[cell.intensity]}`}
                      title={`${cell.date}: ${cell.count}`}
                    />
                  ) : (
                    <div key={ri} className="w-3 h-3" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-slate-400">
        <span>{dict.heatmap.less}</span>
        {LEVELS.map((c, i) => (
          <span key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>{dict.heatmap.more}</span>
      </div>
    </div>
  );
}
