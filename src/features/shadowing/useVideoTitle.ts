"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

// Module-level cache so a videoId's title is fetched at most once per session,
// shared across VideoList cards and the SegmentList header.
const cache = new Map<string, string | null>();

/** Resolves a YouTube video title via the server oEmbed proxy; null until/if unavailable. */
export function useVideoTitle(videoId: string): string | null {
  const [title, setTitle] = useState<string | null>(cache.get(videoId) ?? null);

  useEffect(() => {
    if (cache.has(videoId)) {
      setTitle(cache.get(videoId) ?? null);
      return;
    }
    let cancelled = false;
    apiFetch(`/youtube/oembed?videoId=${videoId}`)
      .then((r) => (r.ok ? r.json() : { title: null }))
      .then((d) => {
        const t = (d?.title as string | null) ?? null;
        cache.set(videoId, t);
        if (!cancelled) setTitle(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return title;
}
