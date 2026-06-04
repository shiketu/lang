import VideoRecorder from "@/features/recordings/components/VideoRecorder";

export default function VideoPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">録画練習</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        日本語で話す自分を録画して、発音や表現を確認しましょう。
      </p>
      <VideoRecorder />
    </div>
  );
}
