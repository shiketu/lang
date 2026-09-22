"use client";

import { useState } from "react";
import { Captions, Save, Scissors, X, Trash2, Check } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { formatClock } from "@/lib/youtube";
import { parseTranscript } from "../parseTranscript";
import type { Video, TranscriptLine } from "../domain/Video";

/** Fallback length for the last line, which has no following line to bound it. */
const TAIL_SECONDS = 5;

export default function TranscriptPanel({
  video,
  onSeek,
  onVideoChange,
  onClipCreated,
}: {
  video: Video;
  onSeek: (t: number) => void;
  onVideoChange: (v: Video) => void;
  onClipCreated: () => void;
}) {
  const dict = useDict();
  const lines = video.transcript ?? [];

  const [pasting, setPasting] = useState(lines.length === 0);
  const [raw, setRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Selection anchors a range of lines that can become a clip.
  const [anchor, setAnchor] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const selRange =
    anchor === null || focus === null
      ? null
      : { from: Math.min(anchor, focus), to: Math.max(anchor, focus) };
  const selCount = selRange ? selRange.to - selRange.from + 1 : 0;

  async function handleSave() {
    const parsed = parseTranscript(raw);
    if (parsed.length === 0) {
      setError(dict.study.transcriptParseFailed);
      return;
    }
    setSaving(true);
    setError("");
    const res = await apiFetch(`/videos/${video.id}/transcript`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: parsed }),
    });
    setSaving(false);
    if (!res.ok) {
      setError(dict.study.saveFailed);
      return;
    }
    onVideoChange(await res.json());
    setRaw("");
    setPasting(false);
    setSaved(true);
  }

  async function handleClear() {
    const res = await apiFetch(`/videos/${video.id}/transcript`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: [] }),
    });
    if (res.ok) {
      onVideoChange(await res.json());
      setPasting(true);
      setAnchor(null);
      setFocus(null);
    }
  }

  function clickLine(i: number, line: TranscriptLine, shift: boolean) {
    if (shift && anchor !== null) {
      setFocus(i);
    } else {
      setAnchor(i);
      setFocus(i);
      onSeek(line.t);
    }
  }

  async function createClipFromSelection() {
    if (!selRange) return;
    const start = lines[selRange.from].t;
    const next = lines[selRange.to + 1];
    const end = next ? next.t : lines[selRange.to].t + TAIL_SECONDS;
    if (end <= start) return;

    setCreating(true);
    const res = await apiFetch("/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoRef: video.id,
        title: lines[selRange.from].text.slice(0, 40),
        segmentStart: start,
        segmentEnd: end,
      }),
    });
    setCreating(false);
    if (res.ok) {
      setAnchor(null);
      setFocus(null);
      onClipCreated();
    } else {
      setError(dict.study.saveFailed);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      {saved && !pasting && (
        <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {dict.study.transcriptSaved}
        </div>
      )}

      {pasting ? (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Captions className="w-4 h-4 text-indigo-500" />
            {dict.study.transcriptHint}
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={12}
            className="field resize-y font-mono text-sm"
            placeholder={dict.study.transcriptPlaceholder}
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} disabled={saving || !raw.trim()} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? dict.study.saving : dict.study.transcriptSave}
            </button>
            {lines.length > 0 && (
              <button onClick={() => setPasting(false)} className="btn-ghost">
                <X className="w-4 h-4" />
                {dict.study.cancel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {fmt(dict.study.transcriptCount, { n: lines.length })}
            </span>
            <span className="text-xs text-slate-400">{dict.study.selectHint}</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setPasting(true)} className="btn-ghost border border-slate-200 dark:border-slate-700">
                {dict.study.editTranscript}
              </button>
              <button onClick={handleClear} className="btn-ghost text-slate-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
                {dict.study.transcriptClear}
              </button>
            </div>
          </div>

          {selCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 px-4 py-2.5">
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                {fmt(dict.study.selectedLines, { n: selCount })}
              </span>
              <button
                onClick={createClipFromSelection}
                disabled={creating}
                className="btn-primary ml-auto"
              >
                <Scissors className="w-4 h-4" />
                {creating ? dict.study.saving : dict.study.createClipFromSelection}
              </button>
              <button
                onClick={() => {
                  setAnchor(null);
                  setFocus(null);
                }}
                className="btn-ghost"
              >
                {dict.study.clearSelection}
              </button>
            </div>
          )}

          <ul className="card divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
            {lines.map((line, i) => {
              const selected = selRange && i >= selRange.from && i <= selRange.to;
              return (
                <li key={i}>
                  <button
                    onClick={(e) => clickLine(i, line, e.shiftKey)}
                    className={`w-full text-left flex gap-3 px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "bg-indigo-50 dark:bg-indigo-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 shrink-0 pt-0.5 tabular-nums">
                      {formatClock(line.t)}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{line.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
