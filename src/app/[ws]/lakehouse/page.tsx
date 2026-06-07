"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";

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
                : "border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
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
  const dict = useDict();
  const typeOptions = TYPE_OPTIONS.map((o) => ({ ...o, label: dict.entryMeta.type[o.value] }));
  const purposeOptions = PURPOSE_OPTIONS.map((o) => ({ ...o, label: dict.entryMeta.purpose[o.value] }));
  const registerOptions = REGISTER_OPTIONS.map((o) => ({ ...o, label: dict.entryMeta.register[o.value] }));

  // seed search from ?q= (header global search)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiFetch("/tags").then((r) => r.json()).then(setTags);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (typeFilter) params.set("type", typeFilter);
    if (purposeFilter) params.set("purpose", purposeFilter);
    if (registerFilter) params.set("register", registerFilter);
    if (tagFilter) params.set("tag", tagFilter);

    apiFetch(`/entries?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, [debounced, typeFilter, purposeFilter, registerFilter, tagFilter]);

  function handleAdded(entry: Entry) {
    setEntries((prev) => [entry, ...prev]);
    if (!tags.length || entry.tags.some((t) => !tags.includes(t))) {
      apiFetch("/tags").then((r) => r.json()).then(setTags);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dict.entries.pageTitle}</h1>
        <button onClick={() => setShowAdd((s) => !s)} className="btn-primary">
          {showAdd ? dict.entries.close : dict.entries.add}
        </button>
      </div>

      {/* Inline quick add */}
      {showAdd && (
        <div className="card p-5 mb-6">
          <EntryForm onSaved={handleAdded} />
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 mb-5">
        <input
          type="text"
          placeholder={dict.entries.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field w-full sm:w-72"
        />
        <div className="flex flex-col gap-2 text-sm">
          <FilterChips options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
          <FilterChips options={purposeOptions} value={purposeFilter} onChange={setPurposeFilter} />
          <FilterChips options={registerOptions} value={registerFilter} onChange={setRegisterFilter} />
          {tags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-fit rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs"
            >
              <option value="">{dict.entries.allTags}</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        {loading ? dict.entries.loading : fmt(dict.entries.count, { n: entries.length })}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 mb-4">{dict.entries.empty}</p>
          {!showAdd && (
            <button onClick={() => setShowAdd(true)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {dict.entries.addFirst}
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
