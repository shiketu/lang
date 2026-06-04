"use client";

import { useState } from "react";
import TagBadge from "@/components/TagBadge";
import type { Entry, EntryType, Purpose, Register } from "../domain/Entry";
import {
  TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  REGISTER_OPTIONS,
  type MetaOption,
} from "./entryMeta";

export interface EntryFormValues {
  id?: string;
  type: EntryType;
  purpose?: Purpose;
  register?: Register;
  japanese: string;
  reading: string;
  meaning: string;
  tags: string[];
  content: string;
}

interface EntryFormProps {
  initialData?: EntryFormValues;
  onSaved: (entry: Entry) => void;
  onCancel?: () => void;
}

const EMPTY: EntryFormValues = {
  type: "vocabulary",
  purpose: undefined,
  register: undefined,
  japanese: "",
  reading: "",
  meaning: "",
  tags: [],
  content: "",
};

/** Single-select chip group. `clearable` lets clicking the active chip unset it. */
function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  clearable,
}: {
  options: MetaOption<T>[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  clearable?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(clearable && active ? undefined : o.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              active
                ? `${o.badge} border-transparent ring-2 ring-offset-1 ring-current/30`
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

export default function EntryForm({
  initialData,
  onSaved,
  onCancel,
}: EntryFormProps) {
  const isEdit = !!initialData?.id;
  const [v, setV] = useState<EntryFormValues>(initialData ?? EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [showMemo, setShowMemo] = useState(!!initialData?.content);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof EntryFormValues>(key: K, val: EntryFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !v.tags.includes(t)) set("tags", [...v.tags, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.japanese.trim() || !v.meaning.trim()) return;
    setSaving(true);

    const payload = {
      type: v.type,
      purpose: v.purpose,
      register: v.register,
      japanese: v.japanese.trim(),
      reading: v.reading.trim() || undefined,
      meaning: v.meaning.trim(),
      tags: v.tags,
      content: v.content,
    };

    const url = isEdit ? `/api/entries/${initialData!.id}` : "/api/entries";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const entry: Entry = await res.json();
      if (!isEdit) {
        setV(EMPTY); // clear for the next quick add
        setShowMemo(false);
      }
      onSaved(entry);
    }
    setSaving(false);
  }

  const input = "field";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          value={v.japanese}
          onChange={(e) => set("japanese", e.target.value)}
          className={input}
          placeholder="日本語 *（例：食べ放題）"
        />
        <input
          type="text"
          value={v.reading}
          onChange={(e) => set("reading", e.target.value)}
          className={input}
          placeholder="読み（たべほうだい）"
        />
      </div>
      <input
        type="text"
        required
        value={v.meaning}
        onChange={(e) => set("meaning", e.target.value)}
        className={input}
        placeholder="意味 *（all-you-can-eat）"
      />

      <div className="space-y-2">
        <div>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">種類</span>
          <ChipGroup options={TYPE_OPTIONS} value={v.type} onChange={(x) => x && set("type", x)} />
        </div>
        <div>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">用途</span>
          <ChipGroup options={PURPOSE_OPTIONS} value={v.purpose} onChange={(x) => set("purpose", x)} clearable />
        </div>
        <div>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">使用場面</span>
          <ChipGroup options={REGISTER_OPTIONS} value={v.register} onChange={(x) => set("register", x)} clearable />
        </div>
      </div>

      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            className={`${input} flex-1`}
            placeholder="タグ（場面・トピックなど）→ Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            追加
          </button>
        </div>
        {v.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {v.tags.map((t) => (
              <TagBadge key={t} tag={t} removable onRemove={() => set("tags", v.tags.filter((x) => x !== t))} />
            ))}
          </div>
        )}
      </div>

      {showMemo ? (
        <textarea
          value={v.content}
          onChange={(e) => set("content", e.target.value)}
          rows={4}
          className={`${input} font-mono`}
          placeholder="メモ（Markdown）：例文・使い方など"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowMemo(true)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          + メモを追加
        </button>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !v.japanese.trim() || !v.meaning.trim()}
          className="btn-primary"
        >
          {saving ? "保存中..." : isEdit ? "更新する" : "追加する"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
