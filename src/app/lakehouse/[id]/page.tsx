"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EntryForm from "@/features/entries/components/EntryForm";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TagBadge from "@/components/TagBadge";
import type { Entry, EntryType, Level } from "@/features/entries/domain/Entry";

const TYPE_LABELS: Record<string, string> = {
  vocabulary: "単語",
  expression: "表現",
  sentence: "例文",
};

export default function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/entries/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setEntry)
      .catch(() => setEntry(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("このエントリーを削除しますか？")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/lakehouse");
      router.refresh();
    }
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>;
  if (!entry) return <p className="text-red-500">エントリーが見つかりません。</p>;

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">エントリー編集</h1>
          <button
            onClick={() => setEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            キャンセル
          </button>
        </div>
        <EntryForm
          initialData={{
            id: entry.id,
            type: entry.type as EntryType,
            japanese: entry.japanese,
            reading: entry.reading ?? "",
            meaning: entry.meaning,
            tags: entry.tags,
            source: entry.source ?? "",
            level: (entry.level as Level) ?? "",
            content: entry.content,
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/lakehouse" className="hover:text-gray-700">
          言語データ
        </Link>
        <span>/</span>
        <span>{entry.japanese}</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{entry.japanese}</h1>
            {entry.reading && <p className="text-lg text-gray-500">{entry.reading}</p>}
          </div>
          <span className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
        </div>

        <p className="text-lg">{entry.meaning}</p>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          {entry.source && <p>出典: {entry.source}</p>}
          {entry.level && <p>レベル: {entry.level}</p>}
          <p>作成: {entry.created}</p>
          <p>更新: {entry.updated}</p>
        </div>

        {entry.content && (
          <div className="border-t dark:border-gray-700 pt-4 mt-4">
            <MarkdownRenderer content={entry.content} />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            編集する
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:text-red-800"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
