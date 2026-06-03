"use client";

import { useState, useEffect } from "react";
import EntryCard from "@/features/entries/components/EntryCard";
import EntryForm from "@/features/entries/components/EntryForm";
import {
  TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  REGISTER_OPTIONS,
  type MetaOption,
} from "@/features/entries/components/entryMeta";
import type { Entry, EntryType, Purpose, Register } from "@/features/entries/domain/Entry";

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: MetaOption<T>[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(active ? "" : o.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              active
                ? `${o.badge} border-transparent`
                : "border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LakehousePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntryType | "">("");
  const [purposeFilter, setPurposeFilter] = useState<Purpose | "">("");
  const [registerFilter, setRegisterFilter] = useState<Register | "">("");
  const [tagFilter, setTagFilter] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then(setTags);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (typeFilter) params.set("type", typeFilter);
    if (purposeFilter) params.set("purpose", purposeFilter);
    if (registerFilter) params.set("register", registerFilter);
    if (tagFilter) params.set("tag", tagFilter);

    fetch(`/api/entries?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, [debounced, typeFilter, purposeFilter, registerFilter, tagFilter]);

  function handleAdded(entry: Entry) {
    setEntries((prev) => [entry, ...prev]);
    if (!tags.length || entry.tags.some((t) => !tags.includes(t))) {
      fetch("/api/tags").then((r) => r.json()).then(setTags);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">言語データ</h1>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          {showAdd ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {/* Inline quick add */}
      {showAdd && (
        <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-900/40">
          <EntryForm onSaved={handleAdded} />
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 mb-5">
        <input
          type="text"
          placeholder="検索…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="flex flex-col gap-2 text-sm">
          <FilterChips options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
          <FilterChips options={PURPOSE_OPTIONS} value={purposeFilter} onChange={setPurposeFilter} />
          <FilterChips options={REGISTER_OPTIONS} value={registerFilter} onChange={setRegisterFilter} />
          {tags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-fit border rounded-md px-2 py-1 text-xs dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">全タグ</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        {loading ? "読み込み中…" : `${entries.length} 件`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">条件に合うデータがありません。</p>
          {!showAdd && (
            <button onClick={() => setShowAdd(true)} className="text-blue-600 hover:underline">
              最初のエントリーを追加する
            </button>
          )}
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
