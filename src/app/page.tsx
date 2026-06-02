import Link from "next/link";
import TodoWidget from "@/features/todos/components/TodoWidget";

export default function Dashboard() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* Today's tasks widget */}
      <div className="mb-6">
        <TodoWidget />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/lakehouse"
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-400 transition-colors"
        >
          <div className="text-3xl mb-2">📚</div>
          <h2 className="text-lg font-bold">言語データ</h2>
          <p className="text-sm text-gray-500 mt-1">
            単語・表現・例文を管理する
          </p>
        </Link>

        <Link
          href="/notes"
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-400 transition-colors"
        >
          <div className="text-3xl mb-2">📝</div>
          <h2 className="text-lg font-bold">毎日ノート</h2>
          <p className="text-sm text-gray-500 mt-1">
            毎日の表現や気づきを記録する
          </p>
        </Link>

        <Link
          href="/practice"
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-400 transition-colors"
        >
          <div className="text-3xl mb-2">✍️</div>
          <h2 className="text-lg font-bold">表現練習</h2>
          <p className="text-sm text-gray-500 mt-1">
            表現力を鍛える
          </p>
        </Link>

        <Link
          href="/video"
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-400 transition-colors"
        >
          <div className="text-3xl mb-2">🎥</div>
          <h2 className="text-lg font-bold">録画練習</h2>
          <p className="text-sm text-gray-500 mt-1">
            発話を録画して確認する
          </p>
        </Link>

        <Link
          href="/todos"
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-400 transition-colors"
        >
          <div className="text-3xl mb-2">✅</div>
          <h2 className="text-lg font-bold">学習計画</h2>
          <p className="text-sm text-gray-500 mt-1">
            タスクと進捗を管理する
          </p>
        </Link>
      </div>
    </div>
  );
}
