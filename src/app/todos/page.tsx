import TodoList from "@/features/todos/components/TodoList";

export default function TodosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">学習計画</h1>
      <p className="text-gray-500 mb-6">
        毎日・毎週の学習タスクを設定して、進捗を管理しましょう。
      </p>
      <TodoList />
    </div>
  );
}
