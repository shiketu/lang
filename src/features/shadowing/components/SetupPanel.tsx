"use client";

import { useState, useRef } from "react";
import { X, Play, Save, Scissors } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import YouTubePlayer, { type YouTubeHandle } from "./YouTubePlayer";
import { parseYouTube, formatClock } from "@/lib/youtube";

export default function SetupPanel({
  existingCategories,
  onCancel,
  onSaved,
}: {
  existingCategories: string[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const player = useRef<YouTubeHandle>(null);
  const dict = useDict();

  function load() {
    const parsed = parseYouTube(url);
    if (!parsed) {
      setError(dict.shadowing.invalidUrl);
      return;
    }
    setError("");
    setVideoId(parsed.videoId);
    setStart(parsed.start ?? 0);
    setEnd(0);
  }

  function setInToCurrent() {
    const t = player.current?.getCurrentTime() ?? 0;
    setStart(Math.min(t, end || duration));
  }
  function setOutToCurrent() {
    const t = player.current?.getCurrentTime() ?? 0;
    setEnd(Math.max(t, start));
  }

  async function save() {
    if (!videoId || end <= start) {
      setError(dict.shadowing.endAfterStart);
      return;
    }
    setSaving(true);
    const res = await apiFetch("/shadowing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceUrl: url,
        title,
        segmentStart: start,
        segmentEnd: end,
        category,
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setError(dict.shadowing.saveFailed);
  }

  return (
    <div className="card p-5 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dict.shadowing.createTitle}</h3>
        <button onClick={onCancel} className="btn-ghost">
          <X className="w-4 h-4" />
          {dict.shadowing.cancel}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={dict.shadowing.urlPlaceholder}
          className="field flex-1"
        />
        <button onClick={load} className="btn-primary shrink-0">
          {dict.shadowing.load}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {videoId && (
        <>
          <YouTubePlayer
            ref={player}
            videoId={videoId}
            start={start}
            onDuration={(d) => {
              setDuration(d);
              if (end === 0) setEnd(d);
            }}
            className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
          />

          {/* Segment selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Scissors className="w-4 h-4" />
              {dict.shadowing.segment}
              <span className="ml-auto font-mono text-indigo-600 dark:text-indigo-400">
                {formatClock(start)} – {formatClock(end)}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={setInToCurrent} className="btn-ghost border border-slate-200 dark:border-slate-700 flex-1">
                {dict.shadowing.setIn}
              </button>
              <button onClick={setOutToCurrent} className="btn-ghost border border-slate-200 dark:border-slate-700 flex-1">
                {dict.shadowing.setOut}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{fmt(dict.shadowing.startLabel, { t: formatClock(start) })}</label>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={start}
                onChange={(e) => setStart(Math.min(Number(e.target.value), end))}
                className="w-full accent-indigo-600"
              />
              <label className="text-xs text-slate-400">{fmt(dict.shadowing.endLabel, { t: formatClock(end) })}</label>
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
              {dict.shadowing.playFromStart}
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.shadowing.titlePlaceholder}
            className="field"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={dict.shadowing.categoryPlaceholder}
            className="field"
            list="shadowing-cats"
          />
          <datalist id="shadowing-cats">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <button onClick={save} disabled={saving || end <= start} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? dict.shadowing.saving : dict.shadowing.saveClip}
          </button>
        </>
      )}
    </div>
  );
}
