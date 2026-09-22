"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Scissors, Captions, Mic, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import ConfirmDialog from "@/components/ConfirmDialog";
import YouTubePlayer, { type YouTubeHandle } from "./YouTubePlayer";
import ClipList from "./ClipList";
import ClipPractice from "./ClipPractice";
import TranscriptPanel from "./TranscriptPanel";
import RetellPanel from "./RetellPanel";
import type { Video } from "../domain/Video";
import type { Clip } from "../domain/Clip";

type Tab = "clips" | "transcript" | "retell";

export default function VideoWorkspace({ videoId }: { videoId: string }) {
  const ws = useWs();
  const dict = useDict();
  const player = useRef<YouTubeHandle>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("clips");
  const [openClip, setOpenClip] = useState<Clip | null>(null);
  const [duration, setDuration] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadVideo = useCallback(async () => {
    const res = await apiFetch(`/videos/${videoId}`);
    if (res.ok) setVideo(await res.json());
    setLoaded(true);
  }, [videoId]);

  const loadClips = useCallback(async () => {
    const res = await apiFetch(`/clips?videoRef=${videoId}`);
    if (res.ok) setClips(await res.json());
  }, [videoId]);

  useEffect(() => {
    loadVideo();
    loadClips();
  }, [loadVideo, loadClips]);

  // Deep link ?clip=<id> (used by the review page) opens that clip directly.
  const [pendingClip, setPendingClip] = useState<string | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("clip");
    if (id) setPendingClip(id);
  }, []);
  useEffect(() => {
    if (pendingClip && clips.length > 0) {
      const c = clips.find((x) => x.id === pendingClip);
      if (c) setOpenClip(c);
      setPendingClip(null);
    }
  }, [pendingClip, clips]);

  async function handleDeleteVideo() {
    await apiFetch(`/videos/${videoId}`, { method: "DELETE" });
    window.location.href = `/${ws}/study`;
  }

  if (!loaded) {
    return <p className="text-slate-500 dark:text-slate-400">{dict.common.loading}</p>;
  }
  if (!video) {
    return <p className="text-slate-500 dark:text-slate-400">{dict.study.noVideos}</p>;
  }

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
    }`;

  // While practising a clip, that panel owns the player — don't run a second one.
  if (openClip) {
    return (
      <ClipPractice
        clip={openClip}
        videoId={video.videoId}
        onBack={() => {
          setOpenClip(null);
          loadClips();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/${ws}/study`} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          {dict.study.backToVideos}
        </Link>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label={dict.common.deleteAction}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{video.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {video.category ? `${video.category} · ` : ""}
          {fmt(dict.study.clipCount, { n: clips.length })}
        </p>
      </div>

      <YouTubePlayer
        ref={player}
        videoId={video.videoId}
        onDuration={setDuration}
        className="aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
      />

      <div className="inline-flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
        <button onClick={() => setTab("clips")} className={tabClass(tab === "clips")}>
          <Scissors className="w-4 h-4" />
          {dict.study.tabClips}
        </button>
        <button onClick={() => setTab("transcript")} className={tabClass(tab === "transcript")}>
          <Captions className="w-4 h-4" />
          {dict.study.tabTranscript}
        </button>
        <button onClick={() => setTab("retell")} className={tabClass(tab === "retell")}>
          <Mic className="w-4 h-4" />
          {dict.study.tabRetell}
        </button>
      </div>

      {tab === "clips" && (
        <ClipList
          video={video}
          clips={clips}
          player={player}
          duration={duration}
          onReload={loadClips}
          onOpenClip={setOpenClip}
        />
      )}

      {tab === "transcript" && (
        <TranscriptPanel
          video={video}
          onSeek={(t) => {
            player.current?.seekTo(t);
            player.current?.play();
          }}
          onVideoChange={setVideo}
          onClipCreated={() => {
            loadClips();
            setTab("clips");
          }}
        />
      )}

      {tab === "retell" && <RetellPanel video={video} />}

      <ConfirmDialog
        open={confirmDelete}
        title={dict.study.deleteVideoTitle}
        message={dict.study.deleteVideoMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={handleDeleteVideo}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
