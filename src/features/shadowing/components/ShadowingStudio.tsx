"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Folder,
  Trash2,
  Mic,
  Circle,
  Square,
  Save,
  X,
  Play,
  ArrowLeft,
  Scissors,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import YouTubePlayer, { type YouTubeHandle } from "./YouTubePlayer";
import { parseYouTube, formatClock } from "@/lib/youtube";
import type { ShadowingTarget } from "../domain/ShadowingTarget";
import type { Recording } from "@/features/recordings/domain/Recording";

type View = "list" | "setup" | "practice";

export default function ShadowingStudio() {
  const dict = useDict();
  const [view, setView] = useState<View>("list");
  const [targets, setTargets] = useState<ShadowingTarget[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    const res = await apiFetch("/shadowing");
    if (res.ok) setTargets(await res.json());
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  // Deep link ?target=<id> opens that target's practice view.
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("target");
    if (id) setPendingTarget(id);
  }, []);
  useEffect(() => {
    if (pendingTarget && targets.length > 0) {
      const t = targets.find((x) => x.id === pendingTarget);
      if (t) {
        setActiveTarget(t);
        setView("practice");
      }
      setPendingTarget(null);
    }
  }, [pendingTarget, targets]);

  const [activeTarget, setActiveTarget] = useState<ShadowingTarget | null>(null);

  async function confirmDelete() {
    if (!deleteId) return;
    await apiFetch(`/shadowing/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    loadTargets();
  }

  return (
    <div>
      {view === "list" && (
        <TargetList
          targets={targets}
          onCreate={() => setView("setup")}
          onOpen={(t) => {
            setActiveTarget(t);
            setView("practice");
          }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {view === "setup" && (
        <SetupPanel
          existingCategories={[...new Set(targets.map((t) => t.category).filter(Boolean) as string[])]}
          onCancel={() => setView("list")}
          onSaved={async () => {
            await loadTargets();
            setView("list");
          }}
        />
      )}

      {view === "practice" && activeTarget && (
        <PracticePanel
          target={activeTarget}
          onBack={() => {
            setActiveTarget(null);
            setView("list");
          }}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={dict.shadowing.deleteClipTitle}
        message={dict.shadowing.deleteClipMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

/* ------------------------------- list ------------------------------- */

function TargetList({
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

/* ------------------------------- setup ------------------------------- */

function SetupPanel({
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

/* ------------------------------ practice ----------------------------- */

function PracticePanel({
  target,
  onBack,
}: {
  target: ShadowingTarget;
  onBack: () => void;
}) {
  const ws = useWs();
  const dict = useDict();
  const refPlayer = useRef<YouTubeHandle>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const selfRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [attempts, setAttempts] = useState<Recording[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "preview" | "saving">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);
  const [deleteAttempt, setDeleteAttempt] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadAttempts = useCallback(async () => {
    const res = await apiFetch(`/shadowing/${target.id}`);
    if (res.ok) {
      const data = await res.json();
      setAttempts(Array.isArray(data.attempts) ? data.attempts : []);
    }
  }, [target.id]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  useEffect(() => {
    if (liveRef.current && stream) liveRef.current.srcObject = stream;
  }, [stream, status]);

  useEffect(() => {
    if (status === "preview" && selfRef.current && recordedBlob) {
      selfRef.current.src = URL.createObjectURL(recordedBlob);
    }
  }, [status, recordedBlob]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      setError("");
    } catch {
      setError(dict.shadowing.cameraDenied);
    }
  }, [dict]);

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      setRecordedBlob(new Blob(chunksRef.current, { type: "video/webm" }));
      setStatus("preview");
      stopCamera();
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setStatus("recording");
    // play the reference segment as you shadow
    refPlayer.current?.seekTo(target.segmentStart);
    refPlayer.current?.play();
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function saveAttempt() {
    if (!recordedBlob) return;
    setStatus("saving");
    const fd = new FormData();
    fd.append("file", recordedBlob, "shadowing.webm");
    fd.append("shadowingTargetId", target.id);
    fd.append("topic", target.title);
    if (target.category) fd.append("category", target.category);
    const res = await apiFetch("/recordings", { method: "POST", body: fd });
    if (res.ok) {
      setRecordedBlob(null);
      setStatus("idle");
      await loadAttempts();
    } else {
      setError(dict.shadowing.saveFailed);
      setStatus("preview");
    }
  }

  function discard() {
    setRecordedBlob(null);
    setStatus("idle");
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
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          {dict.shadowing.back}
        </button>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {formatClock(target.segmentStart)} – {formatClock(target.segmentEnd)}
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{target.title}</h2>

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
          <button onClick={startCamera} className="btn-primary">
            <Mic className="w-4 h-4" />
            {dict.shadowing.startCamera}
          </button>
        )}
        {status === "idle" && stream && (
          <button
            onClick={startRecording}
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
            <button onClick={discard} className="btn-ghost">
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

      {/* Attempt history */}
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
                    setStatus("idle");
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
