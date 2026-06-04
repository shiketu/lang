"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Video, Circle, Square, Folder, Trash2, Save, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Recording } from "../domain/Recording";

const ALL = "__all__";
const NONE = "__none__";
const UNCATEGORIZED_LABEL = "未分類";

export default function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [status, setStatus] = useState<"idle" | "recording" | "preview" | "saving">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>(ALL);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/recordings")
      .then((r) => r.json())
      .then((d) => setRecordings(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, status]);

  useEffect(() => {
    if (status === "preview" && playbackRef.current && recordedBlob) {
      playbackRef.current.src = URL.createObjectURL(recordedBlob);
    }
  }, [status, recordedBlob]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(s);
      setError("");
    } catch {
      setError("カメラへのアクセスが許可されていません。");
    }
  }, []);

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
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setStatus("preview");
      stopCamera();
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setStatus("recording");
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function saveRecording() {
    if (!recordedBlob) return;
    setStatus("saving");

    const formData = new FormData();
    formData.append("file", recordedBlob, "recording.webm");
    if (topic) formData.append("topic", topic);
    if (category.trim()) formData.append("category", category.trim());

    const res = await fetch("/api/recordings", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const meta: Recording = await res.json();
      setRecordings([meta, ...recordings]);
      setRecordedBlob(null);
      setTopic("");
      setCategory("");
      setStatus("idle");
    } else {
      setError("保存に失敗しました。");
      setStatus("preview");
    }
  }

  function discardRecording() {
    setRecordedBlob(null);
    setStatus("idle");
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/recordings/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setRecordings((prev) => prev.filter((r) => r.id !== deleteId));
      if (selectedRecording === deleteId) setSelectedRecording(null);
    }
    setDeleteId(null);
  }

  // Folders: distinct categories + an "uncategorized" bucket when needed.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    let uncategorized = 0;
    for (const r of recordings) {
      const c = r.category?.trim();
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
      else uncategorized += 1;
    }
    return {
      named: Array.from(counts.entries()).sort((a, b) =>
        a[0].localeCompare(b[0], "ja")
      ),
      uncategorized,
    };
  }, [recordings]);

  const filteredRecordings = useMemo(() => {
    if (activeFolder === ALL) return recordings;
    if (activeFolder === NONE) return recordings.filter((r) => !r.category?.trim());
    return recordings.filter((r) => r.category?.trim() === activeFolder);
  }, [recordings, activeFolder]);

  const showLiveCamera = status === "idle" || status === "recording";
  const showPreview = status === "preview";

  function FolderPill({ value, label, count }: { value: string; label: string; count: number }) {
    const active = activeFolder === value;
    return (
      <button
        onClick={() => setActiveFolder(value)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        {value !== ALL && <Folder className="w-3.5 h-3.5" />}
        {label}
        <span className={active ? "opacity-80" : "text-slate-400"}>{count}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording panel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">録画</h3>
          </div>

          {showLiveCamera && (
            <div className="space-y-3">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full rounded-xl object-cover ${stream ? "" : "hidden"}`}
                />
                {!stream && <p className="text-slate-400 text-sm">カメラ未起動</p>}
                {status === "recording" && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    録画中
                  </div>
                )}
              </div>

              {status === "idle" && !stream && (
                <button onClick={startCamera} className="btn-primary">
                  <Video className="w-4 h-4" />
                  カメラを起動する
                </button>
              )}
              {status === "idle" && stream && (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[.98]"
                >
                  <Circle className="w-4 h-4 fill-current" />
                  録画を開始する
                </button>
              )}
              {status === "recording" && (
                <button onClick={stopRecording} className="btn-ghost border border-slate-200 dark:border-slate-700">
                  <Square className="w-4 h-4 fill-current" />
                  録画を停止する
                </button>
              )}
            </div>
          )}

          {showPreview && (
            <div className="space-y-3">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                <video ref={playbackRef} controls playsInline className="w-full h-full rounded-xl" />
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="field"
                placeholder="トピック（任意）"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Folder className="w-4 h-4" />
                  カテゴリ
                </div>
                {categories.named.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.named.map(([name]) => {
                      const active = category.trim() === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setCategory(active ? "" : name)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Folder className="w-3.5 h-3.5" />
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field"
                  placeholder="新しいカテゴリ名（任意）"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={saveRecording} className="btn-primary">
                  <Save className="w-4 h-4" />
                  保存する
                </button>
                <button onClick={discardRecording} className="btn-ghost">
                  <X className="w-4 h-4" />
                  破棄する
                </button>
              </div>
            </div>
          )}

          {status === "saving" && <p className="text-slate-500 text-sm">保存中...</p>}
        </div>

        {/* Recordings list */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">録画一覧</h3>
          </div>

          {recordings.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">録画はまだありません。</p>
          ) : (
            <>
              {/* Folder filter */}
              <div className="flex flex-wrap gap-2 mb-3">
                <FolderPill value={ALL} label="すべて" count={recordings.length} />
                {categories.named.map(([name, count]) => (
                  <FolderPill key={name} value={name} label={name} count={count} />
                ))}
                {categories.uncategorized > 0 && (
                  <FolderPill value={NONE} label={UNCATEGORIZED_LABEL} count={categories.uncategorized} />
                )}
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredRecordings.map((rec) => {
                  const active = selectedRecording === rec.id;
                  return (
                    <div
                      key={rec.id}
                      className={`flex items-center gap-2 rounded-xl border transition-colors ${
                        active
                          ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedRecording(active ? null : rec.id)}
                        className="flex-1 min-w-0 text-left p-3"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {rec.topic || "無題"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {rec.category && (
                            <span className="inline-flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {rec.category}
                            </span>
                          )}
                          <span>{new Date(rec.created).toLocaleString("ja-JP")}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setDeleteId(rec.id)}
                        aria-label="削除"
                        className="shrink-0 mr-2 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {selectedRecording && (
            <div className="mt-4">
              <video
                src={`/api/recordings/${selectedRecording}`}
                controls
                playsInline
                className="w-full rounded-xl"
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="この録画を削除しますか？"
        message="動画は完全に削除され、元に戻せません。"
        confirmLabel="削除する"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
