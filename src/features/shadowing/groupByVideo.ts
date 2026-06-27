import type { ShadowingTarget } from "./domain/ShadowingTarget";

// A video = all shadowing targets (segments) that share a YouTube videoId.
export interface VideoGroup {
  videoId: string;
  referenceUrl: string;
  title: string; // fallback label (earliest segment's title); real title via oEmbed
  categories: string[];
  segments: ShadowingTarget[];
  latestCreated: string;
}

/** Groups flat targets by videoId. Videos newest-first; segments by start time. */
export function groupByVideo(targets: ShadowingTarget[]): VideoGroup[] {
  const map = new Map<string, VideoGroup>();
  for (const t of targets) {
    let g = map.get(t.videoId);
    if (!g) {
      g = {
        videoId: t.videoId,
        referenceUrl: t.referenceUrl,
        title: t.title,
        categories: [],
        segments: [],
        latestCreated: t.created,
      };
      map.set(t.videoId, g);
    }
    g.segments.push(t);
    if (t.category && !g.categories.includes(t.category)) g.categories.push(t.category);
    if (t.created > g.latestCreated) g.latestCreated = t.created;
  }

  const groups = [...map.values()];
  for (const g of groups) {
    g.segments.sort((a, b) => a.segmentStart - b.segmentStart);
    g.title = g.segments[0]?.title ?? g.title;
  }
  groups.sort((a, b) => (a.latestCreated < b.latestCreated ? 1 : -1));
  return groups;
}
