"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Circle, Square, Save, X, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRecorder } from "../hooks/useRecorder";
import type { Video } from "../domain/Video";
import type { Recording } from "@/features/recordings/domain/Recording";

/**
 * Retell practice: after watching, say what the video was about in your own
 * words. The recording hangs off the video (no clip), which is what makes it
 * count as daily output.
 */
export default function RetellPanel({ video }: { video: Video }) {
  const ws = useWs();
  const dict = useDict();
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

  const [retells, setRetells] = useState<Recording[]>([]);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await apiFetch(`/recordings?videoRef=${video.id}&retell=1`);
    if (res.ok) setRetells(await res.json());
  }, [video.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (liveRef.current && stream) liveRef.current.srcObject = stream;
  }, [stream, isRecording]);

  useEffect(() => {
    if (blob && selfRef.current) selfRef.current.src = URL.createObjectURL(blob);
  }, [blob]);

  async function handleStartCamera() {
    const ok = await startCamera();
    setError(ok ? "" : dict.study.cameraDenied);
  }

  async function save() {
    if (!blob) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("file", blob, "retell.webm");
    fd.append("videoRef", video.id);
    fd.append("topic", topic.trim() || video.title);
    if (video.category) fd.append("category", video.category);
    const res = await apiFetch("/recordings", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) {
      discardBlob();
      setTopic("");
      await load();
    } else {
      setError(dict.study.saveFailed);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await apiFetch(`/recordings/${deleteId}`, { method: "DELETE" });
    if (selected === deleteId) setSelected(null);
    setDeleteId(null);
    await load();
  }

  const showLive = !blob && !selected;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">{dict.study.retellHint}</p>

      <div className="card p-3 max-w-2xl">
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <video
            ref={liveRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${showLive && stream ? "" : "hidden"}`}
          />
          <video
            ref={selfRef}
            controls
            playsInline
            src={!blob && selected ? `/api/${ws}/recordings/${selected}` : undefined}
            className={`w-full h-full ${blob || selected ? "" : "hidden"}`}
          />
          {showLive && !stream && (
            <p className="text-slate-400 text-sm">{dict.study.cameraOff}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!stream && !blob && (
          <button onClick={handleStartCamera} className="btn-primary">
            <Mic className="w-4 h-4" />
            {dict.study.startCamera}
          </button>
        )}
        {stream && !isRecording && !blob && (
          <button
            onClick={beginRecording}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[.98]"
          >
            <Circle className="w-4 h-4 fill-current" />
            {dict.study.startRetell}
          </button>
        )}
        {isRecording && (
          <button onClick={stopRecording} className="btn-ghost border border-slate-200 dark:border-slate-700">
            <Square className="w-4 h-4 fill-current" />
            {dict.study.stop}
          </button>
        )}
        {blob && !isRecording && (
          <>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={dict.study.topicPlaceholder}
              className="field w-64"
            />
            <button onClick={save} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? dict.study.saving : dict.study.save}
            </button>
            <button onClick={discardBlob} className="btn-ghost">
              <X className="w-4 h-4" />
              {dict.study.discard}
            </button>
          </>
        )}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
          {dict.study.retellHistory}
        </h4>
        {retells.length === 0 ? (
          <p className="text-sm text-slate-400">{dict.study.noRetells}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {retells.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-1 rounded-xl border pl-3 pr-1 py-1 text-sm transition-colors ${
                  selected === r.id
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                <button
                  onClick={() => {
                    discardBlob();
                    setSelected(selected === r.id ? null : r.id);
                  }}
                  className="text-slate-700 dark:text-slate-200"
                >
                  {new Date(r.created).toLocaleString(ws === "en" ? "en-US" : "ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
                <button
                  onClick={() => setDeleteId(r.id)}
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
        open={deleteId !== null}
        title={dict.study.deleteAttemptTitle}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
