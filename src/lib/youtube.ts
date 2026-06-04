export interface ParsedYouTube {
  videoId: string;
  start?: number; // seconds, from a &t= / ?t= param
}

/** Parses a YouTube URL into its video id (and optional start time). Returns null if not a YouTube URL. */
export function parseYouTube(url: string): ParsedYouTube | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = u.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (u.pathname === "/watch") {
      videoId = u.searchParams.get("v");
    } else {
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?]+)/);
      if (m) videoId = m[2];
    }
  }

  if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null;

  return { videoId, start: parseTimeParam(u.searchParams.get("t")) };
}

/** Parses a YouTube time param ("90", "90s", "1m30s", "1h2m3s") into seconds. */
function parseTimeParam(t: string | null): number | undefined {
  if (!t) return undefined;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return undefined;
  const [, h, min, s] = m;
  const total = (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0);
  return total || undefined;
}

/** Formats seconds as m:ss (or h:mm:ss). */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
