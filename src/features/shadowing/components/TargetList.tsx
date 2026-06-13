"use client";

import { Plus, Folder, Trash2, Scissors } from "lucide-react";
import { useDict } from "@/i18n/I18nProvider";
import { formatClock } from "@/lib/youtube";
import type { ShadowingTarget } from "../domain/ShadowingTarget";

export default function TargetList({
  targets,
  onCreate,
  onOpen,
  onDelete,
}: {
  targets: ShadowingTarget[];
  onCreate: () => void;
  onOpen: (t: ShadowingTarget) => void;
  onDelete: (id: string) => void;
}) {
  const dict = useDict();
  return (
    <div className="space-y-4">
      <button onClick={onCreate} className="btn-primary">
        <Plus className="w-4 h-4" />
        {dict.shadowing.newClip}
      </button>

      {targets.length === 0 ? (
        <div className="card p-10 text-center">
          <Scissors className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{dict.shadowing.noClips}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((t) => (
            <div key={t.id} className="card card-interactive p-4 flex flex-col">
              <button onClick={() => onOpen(t)} className="text-left flex-1">
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${t.videoId}/mqdefault.jpg`}
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Scissors className="w-3 h-3" />
                  {formatClock(t.segmentStart)} – {formatClock(t.segmentEnd)}
                  {t.category && (
                    <span className="inline-flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {t.category}
                    </span>
                  )}
                </div>
              </button>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => onDelete(t.id)}
                  aria-label={dict.common.deleteAction}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
