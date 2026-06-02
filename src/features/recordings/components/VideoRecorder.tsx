"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Recording } from "../domain/Recording";

export default function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [status, setStatus] = useState<"idle" | "recording" | "preview" | "saving">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [topic, setTopic] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/recordings")
      .then((r) => r.json())
      .then(setRecordings);
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

    const res = await fetch("/api/recordings", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const meta: Recording = await res.json();
      setRecordings([meta, ...recordings]);
      setRecordedBlob(null);
      setTopic("");
      setStatus("idle");
    }
  }

  function discardRecording() {
    setRecordedBlob(null);
    setStatus("idle");
  }

  const showLiveCamera = status === "idle" || status === "recording";
  const showPreview = status === "preview";

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold mb-3">録画</h3>

          {showLiveCamera && (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full rounded-lg object-cover ${stream ? "" : "hidden"}`}
                />
                {!stream && <p className="text-gray-400">カメラ未起動</p>}
                {status === "recording" && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    録画中
                  </div>
                )}
              </div>

              {status === "idle" && !stream && (
                <button
                  onClick={startCamera}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  カメラを起動する
                </button>
              )}
              {status === "idle" && stream && (
                <button
                  onClick={startRecording}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  録画を開始する
                </button>
              )}
              {status === "recording" && (
                <button
                  onClick={stopRecording}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  録画を停止する
                </button>
              )}
            </div>
          )}

          {showPreview && (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={playbackRef}
                  controls
                  playsInline
                  className="w-full h-full rounded-lg"
                />
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="トピック（任意）"
              />
              <div className="flex gap-3">
                <button
                  onClick={saveRecording}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  保存する
                </button>
                <button
                  onClick={discardRecording}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  破棄する
                </button>
              </div>
            </div>
          )}

          {status === "saving" && (
            <p className="text-gray-500">保存中...</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">録画一覧</h3>
          {recordings.length === 0 ? (
            <p className="text-gray-500">録画はまだありません。</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {recordings.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecording(rec.id === selectedRecording ? null : rec.id)}
                  className={`w-full text-left border rounded-md p-3 transition-colors ${
                    selectedRecording === rec.id
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  <p className="font-medium">{rec.topic || "無題"}</p>
                  <p className="text-xs text-gray-500">{new Date(rec.created).toLocaleString("ja-JP")}</p>
                </button>
              ))}
            </div>
          )}

          {selectedRecording && (
            <div className="mt-4">
              <video
                src={`/api/recordings/${selectedRecording}`}
                controls
                playsInline
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
