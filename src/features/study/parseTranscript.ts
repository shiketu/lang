import type { TranscriptLine } from "./domain/Video";

// Whole line is just a timestamp: "0:12", "[0:12]", "1:02:34"
const TS_ONLY = /^\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?$/;
// Timestamp followed by text on the same line: "[0:12] text", "0:12 text"
const TS_PREFIX = /^\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?[\s　]+(.+)$/;

function seconds(a: number, b: number, c?: number): number {
  return c === undefined ? a * 60 + b : a * 3600 + b * 60 + c;
}

/**
 * Parses captions pasted from YouTube. Tolerates the three shapes you actually
 * get in practice:
 *   "[00:12] text"          (the bookmarklet's output)
 *   "0:12" + text on the next line(s)   (dragging over YouTube's panel)
 *   "0:12 text"             (timestamp and text on one line, no brackets)
 * Lines without a timestamp are treated as continuations of the previous one.
 */
export function parseTranscript(raw: string): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  let pendingT: number | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (pendingT === null) return;
    const text = buffer.join(" ").replace(/\s+/g, " ").trim();
    if (text) out.push({ t: pendingT, text });
    pendingT = null;
    buffer = [];
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const withText = line.match(TS_PREFIX);
    if (withText) {
      flush();
      const [, h, m, s, text] = withText;
      pendingT = seconds(Number(h), Number(m), s === undefined ? undefined : Number(s));
      buffer = [text];
      flush();
      continue;
    }

    const tsOnly = line.match(TS_ONLY);
    if (tsOnly) {
      flush();
      const [, h, m, s] = tsOnly;
      pendingT = seconds(Number(h), Number(m), s === undefined ? undefined : Number(s));
      continue;
    }

    // Plain text: belongs to the timestamp we're currently collecting.
    if (pendingT !== null) buffer.push(line);
  }
  flush();

  return out.sort((a, b) => a.t - b.t);
}
