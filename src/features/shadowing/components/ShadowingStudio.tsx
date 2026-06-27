"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import VideoList from "./VideoList";
import SegmentList from "./SegmentList";
import SetupPanel from "./SetupPanel";
import ClipWorkspace from "./ClipWorkspace";
import { groupByVideo } from "../groupByVideo";
import type { ShadowingTarget } from "../domain/ShadowingTarget";

type View = "videos" | "segments" | "setup" | "clip";

export default function ShadowingStudio() {
  const dict = useDict();
  const [targets, setTargets] = useState<ShadowingTarget[]>([]);
  const [view, setView] = useState<View>("videos");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<ShadowingTarget | null>(null);
  const [setupLocked, setSetupLocked] = useState<{
    videoId: string;
    referenceUrl: string;
  } | null>(null);
  const [deleteSegmentId, setDeleteSegmentId] = useState<string | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    const res = await apiFetch("/shadowing");
    if (res.ok) setTargets(await res.json());
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  const videos = useMemo(() => groupByVideo(targets), [targets]);
  const activeVideo = useMemo(
    () => videos.find((v) => v.videoId === activeVideoId) ?? null,
    [videos, activeVideoId]
  );
  const existingCategories = useMemo(
    () => [...new Set(targets.map((t) => t.category).filter(Boolean) as string[])],
    [targets]
  );

  // If the open video disappears (e.g. all its segments deleted), fall back.
  useEffect(() => {
    if (view === "segments" && activeVideoId && !activeVideo) {
      setActiveVideoId(null);
      setView("videos");
    }
  }, [view, activeVideoId, activeVideo]);

  // Deep link ?target=<id> opens that segment's clip (back → its video).
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
        setActiveVideoId(t.videoId);
        setView("clip");
      }
      setPendingTarget(null);
    }
  }, [pendingTarget, targets]);

  async function confirmDeleteSegment() {
    if (!deleteSegmentId) return;
    await apiFetch(`/shadowing/${deleteSegmentId}`, { method: "DELETE" });
    setDeleteSegmentId(null);
    await loadTargets();
  }

  async function confirmDeleteVideo() {
    if (!deleteVideoId) return;
    const group = videos.find((v) => v.videoId === deleteVideoId);
    if (group) {
      for (const s of group.segments) {
        await apiFetch(`/shadowing/${s.id}`, { method: "DELETE" });
      }
    }
    setDeleteVideoId(null);
    await loadTargets();
  }

  return (
    <div>
      {view === "videos" && (
        <VideoList
          videos={videos}
          onCreate={() => {
            setSetupLocked(null);
            setView("setup");
          }}
          onOpenVideo={(id) => {
            setActiveVideoId(id);
            setView("segments");
          }}
          onDeleteVideo={(id) => setDeleteVideoId(id)}
        />
      )}

      {view === "segments" && activeVideo && (
        <SegmentList
          video={activeVideo}
          onBack={() => {
            setActiveVideoId(null);
            setView("videos");
          }}
          onOpenSegment={(t) => {
            setActiveTarget(t);
            setView("clip");
          }}
          onAddSegment={() => {
            setSetupLocked({
              videoId: activeVideo.videoId,
              referenceUrl: activeVideo.referenceUrl,
            });
            setView("setup");
          }}
          onDeleteSegment={(id) => setDeleteSegmentId(id)}
        />
      )}

      {view === "setup" && (
        <SetupPanel
          existingCategories={existingCategories}
          lockedVideo={setupLocked ?? undefined}
          onCancel={() => setView(setupLocked ? "segments" : "videos")}
          onSaved={async (created) => {
            setSetupLocked(null);
            await loadTargets();
            setActiveVideoId(created.videoId);
            setView("segments");
          }}
        />
      )}

      {view === "clip" && activeTarget && (
        <ClipWorkspace
          target={activeTarget}
          onBack={() => {
            setActiveTarget(null);
            setView(activeVideoId ? "segments" : "videos");
          }}
        />
      )}

      <ConfirmDialog
        open={deleteSegmentId !== null}
        title={dict.shadowing.deleteClipTitle}
        message={dict.shadowing.deleteClipMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDeleteSegment}
        onCancel={() => setDeleteSegmentId(null)}
      />
      <ConfirmDialog
        open={deleteVideoId !== null}
        title={dict.shadowing.deleteVideoTitle}
        message={dict.shadowing.deleteVideoMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDeleteVideo}
        onCancel={() => setDeleteVideoId(null)}
      />
    </div>
  );
}
