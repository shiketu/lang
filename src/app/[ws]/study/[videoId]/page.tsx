import VideoWorkspace from "@/features/study/components/VideoWorkspace";

export default async function VideoStudyPage({
  params,
}: {
  params: Promise<{ ws: string; videoId: string }>;
}) {
  const { videoId } = await params;
  return (
    <div className="max-w-6xl mx-auto">
      <VideoWorkspace videoId={videoId} />
    </div>
  );
}
