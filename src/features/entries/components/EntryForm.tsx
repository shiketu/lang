"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TagBadge from "@/components/TagBadge";
import type { EntryType, Level } from "../domain/Entry";

interface EntryFormProps {
  initialData?: {
    id?: string;
    type: EntryType;
    japanese: string;
    reading: string;
    meaning: string;
    tags: string[];
    source: string;
    level: Level | "";
    content: string;
  };
}

const TYPES: { value: EntryType; label: string }[] = [
  { value: "vocabulary", label: "単語" },
  { value: "expression", label: "表現" },
  { value: "sentence", label: "例文" },
];

const LEVELS: { value: Level | ""; label: string }[] = [
  { value: "", label: "未設定" },
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

export default function EntryForm({ initialData }: EntryFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [type, setType] = useState<EntryType>(initialData?.type ?? "vocabulary");
  const [japanese, setJapanese] = useState(initialData?.japanese ?? "");
  const [reading, setReading] = useState(initialData?.reading ?? "");
  const [meaning, setMeaning] = useState(initialData?.meaning ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [source, setSource] = useState(initialData?.source ?? "");
  const [level, setLevel] = useState<Level | "">(initialData?.level ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      type,
      japanese,
      reading: reading || undefined,
      meaning,
      tags,
      source: source || undefined,
      level: level || undefined,
      content,
    };

    const url = isEdit ? `/api/entries/${initialData!.id}` : "/api/entries";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const entry = await res.json();
      router.push(`/lakehouse/${entry.id}`);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EntryType)}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">レベル</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level | "")}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">日本語 *</label>
        <input
          type="text"
          required
          value={japanese}
          onChange={(e) => setJapanese(e.target.value)}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          placeholder="食べ放題"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">読み</label>
        <input
          type="text"
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          placeholder="たべほうだい"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">意味 *</label>
        <input
          type="text"
          required
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          placeholder="all-you-can-eat"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">タグ</label>
        <div className="flex gap-2 mb-2">
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
            className="flex-1 border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            placeholder="タグを入力してEnter"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              removable
              onRemove={() => setTags(tags.filter((t) => t !== tag))}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">出典</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          placeholder="教科書、アニメ、会話など"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">メモ（Markdown）</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full border rounded-md px-3 py-2 font-mono text-sm dark:bg-gray-800 dark:border-gray-700"
          placeholder="## 例文&#10;- この店は食べ放題で有名です。&#10;&#10;## メモ&#10;..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "保存中..." : isEdit ? "更新する" : "追加する"}
      </button>
    </form>
  );
}
