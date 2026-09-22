"use client";

import { useState, type RefObject } from "react";
import { Plus, Play, Scissors, Trash2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { formatClock } from "@/lib/youtube";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { YouTubeHandle } from "./YouTubePlayer";
import type { Clip } from "../domain/Clip";
import type { Video } from "../domain/Video";

/**
 * Clips of one video, plus an inline creator that drives the *shared* player
 * at the top of the page (so a video page never runs two players at once).
 */
export default function ClipList({
  video,
  clips,
  player,
  duration,
  onReload,
  onOpenClip,
}: {
  video: Video;
  clips: Clip[];
  player: RefObject<YouTubeHandle | null>;
  duration: number;
  onReload: () => void;
  onOpenClip: (clip: Clip) => void;
}) {
  const dict = useDict();
  const [creating, setCreating] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreator() {
    const now = player.current?.getCurrentTime() ?? 0;
    setStart(now);
    setEnd(Math.min(now + 30, duration || now + 30));
    setTitle("");
    setError("");
    setCreating(true);
  }

  async function save() {
    if (end <= start) {
      setError(dict.study.endAfterStart);
      return;
    }
    setSaving(true);
    const res = await apiFetch("/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoRef: video.id,
        title,
        segmentStart: start,
        segmentEnd: end,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setCreating(false);
      onReload();
    } else {
      setError(dict.study.saveFailed);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await apiFetch(`/clips/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    onReload();
  }

  return (
    <div className="space-y-4">
      {!creating && (
        <button onClick={openCreator} className="btn-primary">
          <Plus className="w-4 h-4" />
          {dict.study.newClip}
        </button>
      )}

      {creating && (
        <div className="card p-4 space-y-3">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Scissors className="w-4 h-4" />
            {dict.study.segment}
            <span className="ml-auto font-mono text-indigo-600 dark:text-indigo-400">
              {formatClock(start)} – {formatClock(end)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStart(Math.min(player.current?.getCurrentTime() ?? 0, end))}
              className="btn-ghost border border-slate-200 dark:border-slate-700 flex-1"
            >
              {dict.study.setIn}
            </button>
            <button
              onClick={() => setEnd(Math.max(player.current?.getCurrentTime() ?? 0, start))}
              className="btn-ghost border border-slate-200 dark:border-slate-700 flex-1"
            >
              {dict.study.setOut}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              {fmt(dict.study.startLabel, { t: formatClock(start) })}
            </label>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={start}
              onChange={(e) => setStart(Math.min(Number(e.target.value), end))}
              className="w-full accent-indigo-600"
            />
            <label className="text-xs text-slate-400">
              {fmt(dict.study.endLabel, { t: formatClock(end) })}
            </label>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={end}
              onChange={(e) => setEnd(Math.max(Number(e.target.value), start))}
              className="w-full accent-indigo-600"
            />
          </div>

          <button
            onClick={() => {
              player.current?.seekTo(start);
              player.current?.play();
            }}
            className="btn-ghost border border-slate-200 dark:border-slate-700"
          >
            <Play className="w-4 h-4" />
            {dict.study.playFromStart}
          </button>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.study.clipTitlePlaceholder}
            className="field"
          />

          <div className="flex gap-2">
            <button onClick={save} disabled={saving || end <= start} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? dict.study.saving : dict.study.saveClip}
            </button>
            <button onClick={() => setCreating(false)} className="btn-ghost">
              <X className="w-4 h-4" />
              {dict.study.cancel}
            </button>
          </div>
        </div>
      )}

      {clips.length === 0 && !creating ? (
        <div className="card p-10 text-center">
          <Scissors className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{dict.study.noClips}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {clips.map((c) => (
            <li key={c.id} className="card card-interactive p-3 flex items-center gap-3">
              <button
                onClick={() => onOpenClip(c)}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                  <Play className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800 dark:text-slate-100 truncate">
                    {c.title}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <Scissors className="w-3 h-3 shrink-0" />
                    {formatClock(c.segmentStart)} – {formatClock(c.segmentEnd)}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setDeleteId(c.id)}
                aria-label={dict.common.deleteAction}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={dict.study.deleteClipTitle}
        message={dict.study.deleteClipMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
