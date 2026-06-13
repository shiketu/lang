"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Circle, Square, Save, X, Play, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import YouTubePlayer, { type YouTubeHandle } from "./YouTubePlayer";
import { useRecorder } from "../hooks/useRecorder";
import type { ShadowingTarget } from "../domain/ShadowingTarget";
import type { Recording } from "@/features/recordings/domain/Recording";

/** Whole-clip shadowing practice (tab 1). Per-sentence attempts live in RepeatPanel. */
export default function ShadowPanel({ target }: { target: ShadowingTarget }) {
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
    startRecording: beginRecording,
    stopRecording,
    discardBlob,
  } = useRecorder({ stopCameraOnStop: true });

  const [attempts, setAttempts] = useState<Recording[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);
  const [deleteAttempt, setDeleteAttempt] = useState<string | null>(null);
  const [error, setError] = useState("");

  const status: "idle" | "recording" | "preview" | "saving" = saving
    ? "saving"
    : blob
    ? "preview"
    : isRecording
    ? "recording"
    : "idle";

  const loadAttempts = useCallback(async () => {
    const res = await apiFetch(`/shadowing/${target.id}`);
    if (res.ok) {
      const data = await res.json();
      const all: Recording[] = Array.isArray(data.attempts) ? data.attempts : [];
      // Whole-clip attempts only; sentence attempts belong to repeat practice.
      setAttempts(all.filter((a) => a.segStart == null));
    }
  }, [target.id]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  useEffect(() => {
    if (liveRef.current && stream) liveRef.current.srcObject = stream;
  }, [stream, status]);

  useEffect(() => {
    if (status === "preview" && selfRef.current && blob) {
      selfRef.current.src = URL.createObjectURL(blob);
    }
  }, [status, blob]);

  async function handleStartCamera() {
    const ok = await startCamera();
    setError(ok ? "" : dict.shadowing.cameraDenied);
  }

  function handleStartRecording() {
    beginRecording();
    // play the reference segment as you shadow
    refPlayer.current?.seekTo(target.segmentStart);
    refPlayer.current?.play();
  }

  async function saveAttempt() {
    if (!blob) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("file", blob, "shadowing.webm");
    fd.append("shadowingTargetId", target.id);
    fd.append("topic", target.title);
    if (target.category) fd.append("category", target.category);
    const res = await apiFetch("/recordings", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) {
      discardBlob();
      await loadAttempts();
    } else {
      setError(dict.shadowing.saveFailed);
    }
  }

  function playBoth() {
    refPlayer.current?.seekTo(target.segmentStart);
    refPlayer.current?.play();
    selfRef.current?.play();
  }

  async function confirmDeleteAttempt() {
    if (!deleteAttempt) return;
    await apiFetch(`/recordings/${deleteAttempt}`, { method: "DELETE" });
    if (selectedAttempt === deleteAttempt) setSelectedAttempt(null);
    setDeleteAttempt(null);
    await loadAttempts();
  }

  const showLive = status === "idle" || status === "recording";

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Side-by-side: reference vs you */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Play className="w-3.5 h-3.5" /> {dict.shadowing.model}
          </p>
          <YouTubePlayer
            ref={refPlayer}
            videoId={target.videoId}
            start={target.segmentStart}
            end={target.segmentEnd}
            loop
            className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
          />
        </div>

        <div className="card p-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> {dict.shadowing.you}
          </p>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {/* live webcam */}
            <video
              ref={liveRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${showLive && stream ? "" : "hidden"}`}
            />
            {/* preview / selected attempt playback */}
            <video
              ref={selfRef}
              controls
              playsInline
              src={
                status !== "preview" && selectedAttempt
                  ? `/api/${ws}/recordings/${selectedAttempt}`
                  : undefined
              }
              className={`w-full h-full ${
                status === "preview" || (status === "idle" && selectedAttempt) ? "" : "hidden"
              }`}
            />
            {showLive && !stream && !selectedAttempt && (
              <p className="text-slate-400 text-sm">{dict.shadowing.cameraOff}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {status === "idle" && !stream && (
          <button onClick={handleStartCamera} className="btn-primary">
            <Mic className="w-4 h-4" />
            {dict.shadowing.startCamera}
          </button>
        )}
        {status === "idle" && stream && (
          <button
            onClick={handleStartRecording}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[.98]"
          >
            <Circle className="w-4 h-4 fill-current" />
            {dict.shadowing.startRecording}
          </button>
        )}
        {status === "recording" && (
          <button onClick={stopRecording} className="btn-ghost border border-slate-200 dark:border-slate-700">
            <Square className="w-4 h-4 fill-current" />
            {dict.shadowing.stop}
          </button>
        )}
        {status === "preview" && (
          <>
            <button onClick={saveAttempt} className="btn-primary">
              <Save className="w-4 h-4" />
              {dict.shadowing.save}
            </button>
            <button onClick={playBoth} className="btn-ghost border border-slate-200 dark:border-slate-700">
              <Play className="w-4 h-4" />
              {dict.shadowing.playBoth}
            </button>
            <button onClick={discardBlob} className="btn-ghost">
              <X className="w-4 h-4" />
              {dict.shadowing.discard}
            </button>
          </>
        )}
        {status === "idle" && selectedAttempt && (
          <button onClick={playBoth} className="btn-primary">
            <Play className="w-4 h-4" />
            {dict.shadowing.playBoth}
          </button>
        )}
        {status === "saving" && <p className="text-slate-500 text-sm self-center">{dict.shadowing.saving}</p>}
      </div>

      {/* Attempt history (whole-clip only) */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">{dict.shadowing.history}</h3>
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
                  onClick={() => {
                    discardBlob();
                    setSelectedAttempt(selectedAttempt === a.id ? null : a.id);
                  }}
                  className="text-slate-700 dark:text-slate-200"
                >
                  {new Date(a.created).toLocaleString(ws === "en" ? "en-US" : "ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
