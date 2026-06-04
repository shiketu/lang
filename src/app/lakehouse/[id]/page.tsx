"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EntryForm from "@/features/entries/components/EntryForm";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TagBadge from "@/components/TagBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  TYPE_LABEL,
  TYPE_BADGE,
  PURPOSE_LABEL,
  PURPOSE_BADGE,
  REGISTER_LABEL,
  REGISTER_BADGE,
} from "@/features/entries/components/entryMeta";
import type { Entry } from "@/features/entries/domain/Entry";

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
  const [showDelete, setShowDelete] = useState(false);

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

  async function confirmDelete() {
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/lakehouse");
      router.refresh();
    }
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>;
  if (!entry) return <p className="text-red-500">エントリーが見つかりません。</p>;

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">エントリー編集</h1>
        </div>
        <EntryForm
          initialData={{
            id: entry.id,
            type: entry.type,
            purpose: entry.purpose,
            register: entry.register,
            japanese: entry.japanese,
            reading: entry.reading ?? "",
            meaning: entry.meaning,
            tags: entry.tags,
            content: entry.content,
          }}
          onSaved={(updated) => {
            setEntry(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/lakehouse" className="hover:text-slate-700 dark:hover:text-slate-200">
          言語データ
        </Link>
        <span>/</span>
        <span className="truncate">{entry.japanese}</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{entry.japanese}</h1>
            {entry.reading && <p className="text-lg text-slate-500 dark:text-slate-400">{entry.reading}</p>}
          </div>
          <span className={`text-sm px-3 py-1 rounded font-medium ${TYPE_BADGE[entry.type]}`}>
            {TYPE_LABEL[entry.type] ?? entry.type}
          </span>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-200">{entry.meaning}</p>

        {(entry.purpose || entry.register) && (
          <div className="flex flex-wrap gap-2">
            {entry.purpose && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${PURPOSE_BADGE[entry.purpose]}`}>
                {PURPOSE_LABEL[entry.purpose]}
              </span>
            )}
            {entry.register && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${REGISTER_BADGE[entry.register]}`}>
                {REGISTER_LABEL[entry.register]}
              </span>
            )}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>作成: {entry.created}</p>
          <p>更新: {entry.updated}</p>
        </div>

        {entry.content && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
            <MarkdownRenderer content={entry.content} />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setEditing(true)} className="btn-primary">
            編集する
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="このエントリーを削除しますか？"
        message="この操作は取り消せません。"
        confirmLabel="削除する"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
