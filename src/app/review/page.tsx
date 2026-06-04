import ReviewSession from "@/features/review/components/ReviewSession";

export default function ReviewPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">
        今日の復習
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        忘却曲線に沿って、積み重ねた表現・練習・録画を最適なタイミングで見直します。
      </p>
      <ReviewSession />
    </div>
  );
}
