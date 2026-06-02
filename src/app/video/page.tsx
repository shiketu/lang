import VideoRecorder from "@/features/recordings/components/VideoRecorder";

export default function VideoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">録画練習</h1>
      <p className="text-gray-500 mb-6">
        日本語で話す自分を録画して、発音や表現を確認しましょう。
      </p>
      <VideoRecorder />
    </div>
  );
}
