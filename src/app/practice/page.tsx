import PracticeSession from "@/features/practice/components/PracticeSession";

export default function PracticePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">表現練習</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        言語データの表現の意味を見て、自分なりの日本語で表現してみましょう。元の表現と比較して、表現力を鍛えます。
      </p>
      <PracticeSession />
    </div>
  );
}
