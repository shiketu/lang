"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EntryCard from "@/features/entries/components/EntryCard";
import type { Entry, EntryType } from "@/features/entries/domain/Entry";

export default function LakehousePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntryType | "">("");
  const [tagFilter, setTagFilter] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (typeFilter) params.set("type", typeFilter);
    if (tagFilter) params.set("tag", tagFilter);

    fetch(`/api/entries?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, [search, typeFilter, tagFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">言語データ</h1>
        <Link
          href="/lakehouse/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 新規追加
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 min-w-[200px]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EntryType | "")}
          className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">全種類</option>
          <option value="vocabulary">単語</option>
          <option value="expression">表現</option>
          <option value="sentence">例文</option>
        </select>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">全タグ</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">エントリーがまだありません。</p>
          <Link href="/lakehouse/new" className="text-blue-600 hover:underline">
            最初のエントリーを追加しましょう
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
