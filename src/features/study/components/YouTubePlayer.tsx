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
  // Latest callbacks, so the [videoId]-only effect never calls a stale one.
  const cb = useRef({ onReady, onDuration });
  cb.current = { onReady, onDuration };
  // getDuration() returns 0 until YouTube has the video's metadata, which is
  // usually *after* onReady — so keep asking in the poll loop until it answers.
  const durationReported = useRef(false);

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
    durationReported.current = false;
    const container = containerRef.current;
    // YT replaces the element it's given with an <iframe>, which conflicts with
    // React's DOM ownership — so mount it on a throwaway child div instead.
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    container?.appendChild(mount);

    loadYT().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(mount, {
        videoId,
        // Embed from the privacy-enhanced domain. Besides not setting tracking
        // cookies, this keeps the JS API working when a browser extension
        // rewrites youtube.com embeds to youtube-nocookie.com: the API talks to
        // the iframe over postMessage and checks its origin, so a rewritten
        // iframe silently breaks onReady / getDuration / getCurrentTime while
        // the video itself still plays. Embedding nocookie up front leaves the
        // extension nothing to rewrite.
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          start: start != null ? Math.floor(start) : undefined,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          // Lets the player validate the postMessage channel against our page.
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            cb.current.onReady?.();
            // Fast path; the poll loop below covers the (common) 0 case.
            const d = playerRef.current?.getDuration?.();
            if (d > 0) {
              durationReported.current = true;
              cb.current.onDuration?.(d);
            }
          },
        },
      });
    });

    timerRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;

      // Report the duration as soon as YouTube knows it (see durationReported).
      if (!durationReported.current) {
        const d = p.getDuration?.() ?? 0;
        if (d > 0) {
          durationReported.current = true;
          cb.current.onDuration?.(d);
        }
      }

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
