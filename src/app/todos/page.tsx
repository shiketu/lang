import TodoList from "@/features/todos/components/TodoList";

export default function TodosPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">学習計画</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        毎日・毎週の学習タスクを設定して、進捗を管理しましょう。
      </p>
      <TodoList />
    </div>
  );
}
