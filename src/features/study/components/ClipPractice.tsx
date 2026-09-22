"use client";

import { useState } from "react";
import { ArrowLeft, Play, Repeat } from "lucide-react";
import { useDict } from "@/i18n/I18nProvider";
import { formatClock } from "@/lib/youtube";
import ShadowPanel from "./ShadowPanel";
import RepeatPanel from "./RepeatPanel";
import type { Clip } from "../domain/Clip";

type Tab = "shadow" | "repeat";

/** One clip opened for practice: whole-clip shadowing, or sentence drilling. */
export default function ClipPractice({
  clip,
  videoId,
  onBack,
}: {
  clip: Clip;
  videoId: string;
  onBack: () => void;
}) {
  const dict = useDict();
  const [tab, setTab] = useState<Tab>("shadow");

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
    }`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          {dict.study.backToClips}
        </button>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          {formatClock(clip.segmentStart)} – {formatClock(clip.segmentEnd)}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{clip.title}</h3>

      <div className="inline-flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
        <button onClick={() => setTab("shadow")} className={tabClass(tab === "shadow")}>
          <Play className="w-4 h-4" />
          {dict.study.tabShadow}
        </button>
        <button onClick={() => setTab("repeat")} className={tabClass(tab === "repeat")}>
          <Repeat className="w-4 h-4" />
          {dict.study.tabRepeat}
        </button>
      </div>

      {/* One panel at a time so each owns its own player/recorder lifecycle. */}
      {tab === "shadow" ? (
        <ShadowPanel clip={clip} videoId={videoId} />
      ) : (
        <RepeatPanel clip={clip} videoId={videoId} />
      )}
    </div>
  );
}
