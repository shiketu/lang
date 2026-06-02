"use client";

import { useState, useEffect, useCallback } from "react";
import TagBadge from "@/components/TagBadge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Note } from "../domain/Note";

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return formatLocalDate(new Date());
}

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return formatLocalDate(new Date(y, m - 1, d + days));
}

function formatDateLabel(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function NoteEditor() {
  const [date, setDate] = useState(todayStr);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [noteList, setNoteList] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load list of all notes
  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then(setNoteList);
  }, []);

  // Load note for current date
  const loadNote = useCallback(async (d: string) => {
    setLoaded(false);
    const res = await fetch(`/api/notes/${d}`);
    if (res.ok) {
      const note: Note = await res.json();
      setContent(note.content);
      setTags(note.tags);
    } else {
      setContent("");
      setTags([]);
    }
    setDirty(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadNote(date);
  }, [date, loadNote]);

  function navigateTo(d: string) {
    if (dirty && !confirm("未保存の変更があります。破棄しますか？")) return;
    setDate(d);
    setPreview(false);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setDirty(true);
    }
    setTagInput("");
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/notes/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, tags }),
    });
    if (res.ok) {
      setDirty(false);
      // Refresh note list
      const listRes = await fetch("/api/notes");
      if (listRes.ok) setNoteList(await listRes.json());
    }
    setSaving(false);
  }

  const isToday = date === todayStr();
  const isFuture = date > todayStr();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Main editor area */}
      <div className="space-y-4">
        {/* Date navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(shiftDate(date, -1))}
            className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ←
          </button>
          <h2 className="text-lg font-bold">{formatDateLabel(date)}</h2>
          <button
            onClick={() => navigateTo(shiftDate(date, 1))}
            disabled={isFuture}
            className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-30 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            →
          </button>
          {!isToday && (
            <button
              onClick={() => navigateTo(todayStr())}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              今日
            </button>
          )}
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              未保存
            </span>
          )}
        </div>

        {/* Editor / Preview toggle */}
        <div className="flex gap-2 border-b dark:border-gray-700 pb-2">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1 text-sm rounded-t-md ${
              !preview
                ? "bg-gray-200 dark:bg-gray-700 font-medium"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            編集
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1 text-sm rounded-t-md ${
              preview
                ? "bg-gray-200 dark:bg-gray-700 font-medium"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            プレビュー
          </button>
        </div>

        {/* Content */}
        {!loaded ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : preview ? (
          <div className="min-h-[400px] border rounded-md p-4 dark:border-gray-700">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-gray-400">内容がありません。</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            rows={18}
            className="w-full border rounded-md px-3 py-2 font-mono text-sm dark:bg-gray-800 dark:border-gray-700 resize-y"
            placeholder={`## 今日の表現\n\n- 食べ放題（たべほうだい）- all-you-can-eat\n  - この店は食べ放題で有名です。\n\n## メモ\n...`}
          />
        )}

        {/* Tags */}
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
                onRemove={() => {
                  setTags(tags.filter((t) => t !== tag));
                  setDirty(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>

      {/* Sidebar: recent notes */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-gray-500">ノート一覧</h3>
        {noteList.length === 0 ? (
          <p className="text-sm text-gray-400">ノートはまだありません。</p>
        ) : (
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {noteList.map((note) => (
              <button
                key={note.date}
                onClick={() => navigateTo(note.date)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  note.date === date
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <p className="font-medium">{note.date}</p>
                <p className="text-xs text-gray-500 truncate">
                  {note.content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || "空"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
