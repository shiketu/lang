import { listEntries } from "@/features/entries/application/service";
import { listVideos } from "@/features/study/application/videoService";
import { listClips } from "@/features/study/application/clipService";
import { listRecordings } from "@/features/recordings/application/service";
import { getActivityRange } from "@/features/activity/application/service";
import { todayInTokyo } from "@/lib/today";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

// Accumulation view for the home page: how much has been built up, not how
// busy today was. Totals come from the stores; the growth curve is derived
// from activity_log, which already keeps a per-day count per kind.
export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const today = todayInTokyo();

  const [entries, videos, clips, recordings, logs] = await Promise.all([
    listEntries(),
    listVideos(),
    listClips(),
    listRecordings(),
    getActivityRange("2020-01-01", today),
  ]);

  const sumOf = (kind: string) =>
    logs.filter((l) => l.kind === kind).reduce((s, l) => s + l.count, 0);

  return Response.json({
    totals: {
      entries: entries.length,
      videos: videos.length,
      clips: clips.length,
      recordings: recordings.length,
      reviews: sumOf("review"),
    },
    series: logs,
  });
});
