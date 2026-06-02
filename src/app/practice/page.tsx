import PracticeSession from "@/features/practice/components/PracticeSession";

export default function PracticePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">表現練習</h1>
      <p className="text-gray-500 mb-6">
        言語データの表現の意味を見て、自分なりの日本語で表現してみましょう。元の表現と比較して、表現力を鍛えます。
      </p>
      <PracticeSession />
    </div>
  );
}
