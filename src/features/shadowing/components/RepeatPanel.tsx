"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Mic,
  Circle,
  Square,
  Save,
  X,
  Scissors,
  SkipForward,
  Flag,
  PartyPopper,
  NotebookPen,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { todayInTokyo } from "@/lib/today";
import { formatClock } from "@/lib/youtube";
import ConfirmDialog from "@/components/ConfirmDialog";
import YouTubePlayer, { type YouTubeHandle } from "./YouTubePlayer";
import { useRecorder } from "../hooks/useRecorder";
import type { ShadowingTarget } from "../domain/ShadowingTarget";
import type { Recording } from "@/features/recordings/domain/Recording";

type Phase = "watching" | "sentence" | "done";
interface Sentence {
  start: number;
  end: number;
}

const RATES = [0.5, 0.75, 1] as const;
const MIN_SENTENCE = 0.3; // seconds

/** Sentence-by-sentence repeat practice (tab 2): mark → listen closely → record → compare → next. */
export default function RepeatPanel({ target }: { target: ShadowingTarget }) {
  const ws = useWs();
  const dict = useDict();
  const refPlayer = useRef<YouTubeHandle>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const selfRef = useRef<HTMLVideoElement>(null);

  const {
    stream,
    blob,
    isRecording,
    startCamera,
    stopCamera,
    startRecording: beginRecording,
    stopRecording,
    discardBlob,
  } = useRecorder({ stopCameraOnStop: false });

  const [phase, setPhase] = useState<Phase>("watching");
  const [cursor, setCursor] = useState(target.segmentStart);
  const [sent, setSent] = useState<Sentence | null>(null);
  const [rate, setRate] = useState(1);
  const [sessionList, setSessionList] = useState<(Sentence & { saved: boolean })[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [attempts, setAttempts] = useState<Recording[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);
  const [deleteAttempt, setDeleteAttempt] = useState<string | null>(null);

  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoSaved, setMemoSaved] = useState(false);

  const loadAttempts = useCallback(async () => {
    const res = await apiFetch(`/shadowing/${target.id}`);
    if (res.ok) {
      const data = await res.json();
      const all: Recording[] = Array.isArray(data.attempts) ? data.attempts : [];
      // Sentence attempts only — whole-clip ones belong to the shadowing tab.
      setAttempts(all.filter((a) => a.segStart != null));
    }
  }, [target.id]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Release the camera when leaving the tab.
  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (liveRef.current && stream) liveRef.current.srcObject = stream;
  }, [stream, phase, blob]);

  useEffect(() => {
    if (blob && selfRef.current) {
      selfRef.current.src = URL.createObjectURL(blob);
    }
  }, [blob]);

  // Auto-finish when playback reaches the end of the clip while watching.
  useEffect(() => {
    if (phase !== "watching") return;
    const id = window.setInterval(() => {
      const t = refPlayer.current?.getCurrentTime() ?? 0;
      if (t >= target.segmentEnd - 0.05) {
        refPlayer.current?.pause();
        setPhase("done");
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, target.segmentEnd]);

  /* ----------------------------- watching ----------------------------- */

  function playFromCursor() {
    refPlayer.current?.seekTo(cursor);
    refPlayer.current?.play();
  }

  function markHere() {
    const now = refPlayer.current?.getCurrentTime() ?? cursor;
    refPlayer.current?.pause();
    const start = Math.max(target.segmentStart, Math.min(cursor, target.segmentEnd - MIN_SENTENCE));
    const end = Math.min(Math.max(now, start + MIN_SENTENCE), target.segmentEnd);
    setSent({ start, end });
    setSelectedAttempt(null);
    discardBlob();
    setPhase("sentence");
    // Immediately replay the marked sentence (the loop keeps it bounded).
    refPlayer.current?.seekTo(start);
    refPlayer.current?.play();
  }

  function finishSession() {
    refPlayer.current?.pause();
    setPhase("done");
  }

  /* ----------------------------- sentence ----------------------------- */

  function listenAgain() {
    if (!sent) return;
    refPlayer.current?.seekTo(sent.start);
    refPlayer.current?.play();
  }

  function changeRate(r: number) {
    setRate(r);
    refPlayer.current?.setPlaybackRate(r);
  }

  function nudge(which: "start" | "end", delta: number) {
    if (!sent) return;
    if (which === "start") {
      const s = Math.min(
        Math.max(target.segmentStart, sent.start + delta),
        sent.end - MIN_SENTENCE
      );
      setSent({ ...sent, start: s });
    } else {
      const e = Math.max(
        Math.min(target.segmentEnd, sent.end + delta),
        sent.start + MIN_SENTENCE
      );
      setSent({ ...sent, end: e });
    }
  }

  async function handleStartCamera() {
    const ok = await startCamera();
    setError(ok ? "" : dict.shadowing.cameraDenied);
  }

  function recordSentence() {
    if (!sent) return;
    beginRecording();
    refPlayer.current?.seekTo(sent.start);
    refPlayer.current?.play();
  }

  function playBoth() {
    if (!sent) return;
    refPlayer.current?.seekTo(sent.start);
    refPlayer.current?.play();
    selfRef.current?.play();
  }

  function advance(saved: boolean) {
    if (!sent) return;
    setSessionList((prev) => [...prev, { ...sent, saved }]);
    const next = sent.end;
    setSent(null);
    setSelectedAttempt(null);
    discardBlob();
    setCursor(next);
    if (next >= target.segmentEnd - MIN_SENTENCE) {
      refPlayer.current?.pause();
      setPhase("done");
    } else {
      setPhase("watching");
      refPlayer.current?.seekTo(next);
      refPlayer.current?.play();
    }
  }

  async function saveAndNext() {
    if (!blob || !sent) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("file", blob, "repeat.webm");
    fd.append("shadowingTargetId", target.id);
    fd.append("topic", target.title);
    if (target.category) fd.append("category", target.category);
    fd.append("segStart", String(sent.start));
    fd.append("segEnd", String(sent.end));
    const res = await apiFetch("/recordings", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) {
      await loadAttempts();
      advance(true);
    } else {
      setError(dict.shadowing.saveFailed);
    }
  }

  /* ------------------------------- memo ------------------------------- */

  async function appendMemo() {
    const text = memo.trim();
    if (!text) return;
    setMemoSaving(true);
    const today = todayInTokyo();
    let content = "";
    let tags: string[] = [];
    const res = await apiFetch(`/notes/${today}`);
    if (res.ok) {
      const note = await res.json();
      content = note.content ?? "";
      tags = note.tags ?? [];
    }
    const block = `## ${fmt(dict.shadowing.memoHeading, { title: target.title })}\n\n${text}`;
    const next = content.trim() ? `${content.trimEnd()}\n\n${block}` : block;
    const put = await apiFetch(`/notes/${today}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: next, tags }),
    });
    setMemoSaving(false);
    if (put.ok) {
      setMemo("");
      setMemoSaved(true);
    } else {
      setError(dict.shadowing.saveFailed);
    }
  }

  /* ------------------------------ review ------------------------------ */

  function reviewAttempt(a: Recording) {
    if (a.segStart == null || a.segEnd == null) return;
    discardBlob();
    setSent({ start: a.segStart, end: a.segEnd });
    setPhase("sentence");
    setSelectedAttempt(selectedAttempt === a.id ? null : a.id);
    refPlayer.current?.seekTo(a.segStart);
  }

  async function confirmDeleteAttempt() {
    if (!deleteAttempt) return;
    await apiFetch(`/recordings/${deleteAttempt}`, { method: "DELETE" });
    if (selectedAttempt === deleteAttempt) setSelectedAttempt(null);
    setDeleteAttempt(null);
    await loadAttempts();
  }

  function restart() {
    setCursor(target.segmentStart);
    setSent(null);
    setSessionList([]);
    setSelectedAttempt(null);
    discardBlob();
    setPhase("watching");
    refPlayer.current?.setPlaybackRate(1);
    setRate(1);
    refPlayer.current?.seekTo(target.segmentStart);
  }

  const showLiveVideo = !!stream && !blob && !selectedAttempt;
  const showSelfVideo = !!blob || (!!selectedAttempt && !isRecording);

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {phase === "done" ? (
        <div className="card p-10 text-center space-y-3">
          <PartyPopper className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {dict.shadowing.doneTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {fmt(dict.shadowing.doneCount, { n: sessionList.length })}
          </p>
          {memo.trim() && !memoSaved && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {dict.shadowing.memoReminder}
            </p>
          )}
          <button onClick={restart} className="btn-primary inline-flex">
            <RotateCcw className="w-4 h-4" />
            {dict.shadowing.again}
          </button>
        </div>
      ) : (
        <>
          {/* Side-by-side: reference vs you */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Play className="w-3.5 h-3.5" /> {dict.shadowing.model}
              </p>
              <YouTubePlayer
                ref={refPlayer}
                videoId={target.videoId}
                start={sent ? sent.start : target.segmentStart}
                end={sent ? sent.end : undefined}
                loop={phase === "sentence" && !!sent}
                className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div className="card p-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" /> {dict.shadowing.you}
              </p>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <video
                  ref={liveRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${showLiveVideo || isRecording ? "" : "hidden"}`}
                />
                <video
                  ref={selfRef}
                  controls
                  playsInline
                  src={
                    !blob && selectedAttempt
                      ? `/api/${ws}/recordings/${selectedAttempt}`
                      : undefined
                  }
                  className={`w-full h-full ${showSelfVideo && !isRecording ? "" : "hidden"}`}
                />
                {!stream && !blob && !selectedAttempt && (
                  <p className="text-slate-400 text-sm">{dict.shadowing.cameraOff}</p>
                )}
              </div>
            </div>
          </div>

          {/* Watching controls */}
          {phase === "watching" && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">{dict.shadowing.watchHint}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={playFromCursor} className="btn-ghost border border-slate-200 dark:border-slate-700">
                  <Play className="w-4 h-4" />
                  {dict.shadowing.playFromHere}（{formatClock(cursor)}）
                </button>
                <button onClick={markHere} className="btn-primary">
                  <Scissors className="w-4 h-4" />
                  {dict.shadowing.markHere}
                </button>
                <button onClick={finishSession} className="btn-ghost">
                  <Flag className="w-4 h-4" />
                  {dict.shadowing.finishSession}
                </button>
              </div>
            </div>
          )}

          {/* Sentence controls */}
          {phase === "sentence" && sent && (
            <div className="card p-4 space-y-3">
              {/* Range + nudges + speed */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {dict.shadowing.sentenceLabel}
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {formatClock(sent.start)} – {formatClock(sent.end)}
                </span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="text-xs text-slate-400">{fmt(dict.shadowing.startLabel, { t: "" })}</span>
                  <button onClick={() => nudge("start", -0.5)} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">−0.5s</button>
                  <button onClick={() => nudge("start", 0.5)} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">+0.5s</button>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">{fmt(dict.shadowing.endLabel, { t: "" })}</span>
                  <button onClick={() => nudge("end", -0.5)} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">−0.5s</button>
                  <button onClick={() => nudge("end", 0.5)} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">+0.5s</button>
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-slate-400">{dict.shadowing.speed}</span>
                  {RATES.map((r) => (
                    <button
                      key={r}
                      onClick={() => changeRate(r)}
                      className={`px-2 py-0.5 rounded-lg text-xs transition-colors ${
                        rate === r
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {r}×
                    </button>
                  ))}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button onClick={listenAgain} className="btn-ghost border border-slate-200 dark:border-slate-700">
                  <Play className="w-4 h-4" />
                  {dict.shadowing.listenAgain}
                </button>

                {!stream && !isRecording && (
                  <button onClick={handleStartCamera} className="btn-primary">
                    <Mic className="w-4 h-4" />
                    {dict.shadowing.startCamera}
                  </button>
                )}
                {stream && !isRecording && !blob && (
                  <button
                    onClick={recordSentence}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[.98]"
                  >
                    <Circle className="w-4 h-4 fill-current" />
                    {dict.shadowing.recordSentence}
                  </button>
                )}
                {isRecording && (
                  <button onClick={stopRecording} className="btn-ghost border border-slate-200 dark:border-slate-700">
                    <Square className="w-4 h-4 fill-current" />
                    {dict.shadowing.stop}
                  </button>
                )}
                {(blob || selectedAttempt) && !isRecording && (
                  <button onClick={playBoth} className="btn-ghost border border-slate-200 dark:border-slate-700">
                    <Play className="w-4 h-4" />
                    {dict.shadowing.playBoth}
                  </button>
                )}
                {blob && !isRecording && (
                  <>
                    <button onClick={saveAndNext} disabled={saving} className="btn-primary">
                      <Save className="w-4 h-4" />
                      {saving ? dict.shadowing.saving : dict.shadowing.saveNext}
                    </button>
                    <button onClick={discardBlob} className="btn-ghost">
                      <X className="w-4 h-4" />
                      {dict.shadowing.retake}
                    </button>
                  </>
                )}
                <button onClick={() => advance(false)} className="btn-ghost ml-auto">
                  <SkipForward className="w-4 h-4" />
                  {dict.shadowing.skip}
                </button>
              </div>
            </div>
          )}

          {/* Session sentences */}
          {sessionList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                {dict.shadowing.sessionList}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessionList.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-600 dark:text-slate-300"
                  >
                    {formatClock(s.start)}–{formatClock(s.end)}
                    {s.saved && <span className="text-emerald-500">✓</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Practice memo (always visible) */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <NotebookPen className="w-4 h-4 text-indigo-500" />
          {dict.shadowing.memoTitle}
        </div>
        <textarea
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            setMemoSaved(false);
          }}
          rows={3}
          className="field resize-y"
          placeholder={dict.shadowing.memoPlaceholder}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={appendMemo}
            disabled={memoSaving || !memo.trim()}
            className="btn-primary"
          >
            <NotebookPen className="w-4 h-4" />
            {memoSaving ? dict.shadowing.saving : dict.shadowing.memoAppend}
          </button>
          {memoSaved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              {dict.shadowing.memoAppended}
            </span>
          )}
        </div>
      </div>

      {/* Sentence attempt history */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
          {dict.shadowing.history}
        </h3>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-400">{dict.shadowing.noHistory}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {attempts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-1 rounded-xl border pl-3 pr-1 py-1 text-sm transition-colors ${
                  selectedAttempt === a.id
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                <button
                  onClick={() => reviewAttempt(a)}
                  className="text-slate-700 dark:text-slate-200 font-mono text-xs"
                >
                  {formatClock(a.segStart ?? 0)}–{formatClock(a.segEnd ?? 0)}
                </button>
                <button
                  onClick={() => setDeleteAttempt(a.id)}
                  aria-label={dict.common.deleteAction}
                  className="p-1 rounded text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteAttempt !== null}
        title={dict.shadowing.deleteAttemptTitle}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDeleteAttempt}
        onCancel={() => setDeleteAttempt(null)}
      />
    </div>
  );
}
