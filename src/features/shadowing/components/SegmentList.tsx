"use client";

import { ArrowLeft, Plus, Trash2, Scissors, Folder, Play } from "lucide-react";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { formatClock } from "@/lib/youtube";
import { useVideoTitle } from "../useVideoTitle";
import type { VideoGroup } from "../groupByVideo";
import type { ShadowingTarget } from "../domain/ShadowingTarget";

export default function SegmentList({
  video,
  onOpenSegment,
  onAddSegment,
  onDeleteSegment,
  onBack,
}: {
  video: VideoGroup;
  onOpenSegment: (t: ShadowingTarget) => void;
  onAddSegment: () => void;
  onDeleteSegment: (id: string) => void;
  onBack: () => void;
}) {
  const dict = useDict();
  const title = useVideoTitle(video.videoId) || video.title || video.videoId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          {dict.shadowing.backToVideos}
        </button>
        <button onClick={onAddSegment} className="btn-primary">
          <Plus className="w-4 h-4" />
          {dict.shadowing.addSegment}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
          alt={title}
          className="w-28 aspect-video rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {fmt(dict.shadowing.videoCount, { n: video.segments.length })}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
          {dict.shadowing.segmentsHeading}
        </h3>
        <ul className="space-y-2">
          {video.segments.map((s) => (
            <li key={s.id} className="card card-interactive p-3 flex items-center gap-3">
              <button
                onClick={() => onOpenSegment(s)}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                  <Play className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800 dark:text-slate-100 truncate">
                    {s.title}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Scissors className="w-3 h-3 shrink-0" />
                    {formatClock(s.segmentStart)} – {formatClock(s.segmentEnd)}
                    {s.category && (
                      <span className="inline-flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {s.category}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                onClick={() => onDeleteSegment(s.id)}
                aria-label={dict.common.deleteAction}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
