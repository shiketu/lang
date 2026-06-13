"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface YouTubeHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
}

interface Props {
  videoId: string;
  start?: number;
  end?: number;
  /** Loop playback within [start, end]. */
  loop?: boolean;
  className?: string;
  onReady?: () => void;
  onDuration?: (seconds: number) => void;
}

// Load the IFrame API exactly once, resolving when window.YT is ready.
let ytPromise: Promise<any> | null = null;
function loadYT(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytPromise;
}

const YouTubePlayer = forwardRef<YouTubeHandle, Props>(function YouTubePlayer(
  { videoId, start, end, loop, className, onReady, onDuration },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  // Latest segment, read inside the poll loop without re-subscribing.
  const seg = useRef({ start, end, loop });
  seg.current = { start, end, loop };

  useImperativeHandle(ref, () => ({
    seekTo: (s) => playerRef.current?.seekTo?.(s, true),
    play: () => playerRef.current?.playVideo?.(),
    pause: () => playerRef.current?.pauseVideo?.(),
    getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
    getDuration: () => playerRef.current?.getDuration?.() ?? 0,
    setPlaybackRate: (rate) => playerRef.current?.setPlaybackRate?.(rate),
  }));

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    // YT replaces the element it's given with an <iframe>, which conflicts with
    // React's DOM ownership — so mount it on a throwaway child div instead.
    const host = document.createElement("div");
    host.style.width = "100%";
    host.style.height = "100%";
    container?.appendChild(host);

    loadYT().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(host, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          start: start != null ? Math.floor(start) : undefined,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            onReady?.();
            const d = playerRef.current?.getDuration?.();
            if (d) onDuration?.(d);
          },
        },
      });
    });

    timerRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const { start: s, end: e, loop: l } = seg.current;
      if (l && e != null && s != null) {
        const t = p.getCurrentTime();
        if (t >= e || t < s - 0.5) p.seekTo(s, true);
      }
    }, 250);

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      if (container) container.innerHTML = "";
    };
    // Recreate the player only when the video changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});

export default YouTubePlayer;
