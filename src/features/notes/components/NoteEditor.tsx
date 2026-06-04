"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Save, Sparkles, X } from "lucide-react";
import TagBadge from "@/components/TagBadge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Note } from "../domain/Note";
import type { ExtractedEntry } from "../domain/ExtractedEntry";

type Candidate = ExtractedEntry & { selected: boolean };

const TYPE_OPTIONS: { value: ExtractedEntry["type"]; label: string }[] = [
  { value: "vocabulary", label: "単語" },
  { value: "expression", label: "表現" },
  { value: "sentence", label: "例文" },
];

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

  // LLM extraction
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

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

  async function handleExtract() {
    // Extraction reads the note from the server, so persist edits first.
    if (dirty) {
      await fetch(`/api/notes/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags }),
      });
      setDirty(false);
    }
    setExtracting(true);
    const res = await fetch(`/api/notes/${date}/extract`, { method: "POST" });
    setExtracting(false);
    if (res.ok) {
      const items: ExtractedEntry[] = await res.json();
      setCandidates(items.map((c) => ({ ...c, selected: true })));
      setModalOpen(true);
    }
  }

  function updateCandidate(index: number, patch: Partial<Candidate>) {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }

  async function handleImport() {
    const selected = candidates
      .filter((c) => c.selected)
      .map(({ selected: _selected, ...c }) => c);
    if (selected.length === 0) return;
    setImporting(true);
    const res = await fetch("/api/entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: selected }),
    });
    setImporting(false);
    if (res.ok) {
      const data = await res.json();
      setModalOpen(false);
      setCandidates([]);
      alert(`${data.count} 件の条目を言語データに追加しました。`);
    }
  }

  const isToday = date === todayStr();
  const isFuture = date > todayStr();
  const selectedCount = candidates.filter((c) => c.selected).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Main editor area */}
      <div className="space-y-4">
        {/* Date navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(shiftDate(date, -1))}
            aria-label="前の日"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {formatDateLabel(date)}
          </h2>
          <button
            onClick={() => navigateTo(shiftDate(date, 1))}
            disabled={isFuture}
            aria-label="次の日"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              onClick={() => navigateTo(todayStr())}
              className="px-3 py-1.5 text-sm rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
            >
              今日
            </button>
          )}
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">未保存</span>
          )}
        </div>

        {/* Editor / Preview toggle */}
        <div className="inline-flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              !preview
                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            編集
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              preview
                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            プレビュー
          </button>
        </div>

        {/* Content */}
        {!loaded ? (
          <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
        ) : preview ? (
          <div className="min-h-[400px] card p-4">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-slate-400">内容がありません。</p>
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
            className="field font-mono resize-y"
            placeholder={`## 今日の表現\n\n- 食べ放題（たべほうだい）- all-you-can-eat\n  - この店は食べ放題で有名です。\n\n## メモ\n...`}
          />
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
            タグ
          </label>
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
              className="field flex-1"
              placeholder="タグを入力してEnter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving || !dirty} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存する"}
          </button>
          <button
            onClick={handleExtract}
            disabled={extracting || !content.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            title="このノートからAIで表現を抽出し、条目として追加します"
          >
            <Sparkles className="w-4 h-4" />
            {extracting ? "抽出中..." : "AIで条目を抽出"}
          </button>
        </div>
      </div>

      {/* Sidebar: recent notes */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-slate-500 dark:text-slate-400">
          ノート一覧
        </h3>
        {noteList.length === 0 ? (
          <p className="text-sm text-slate-400">ノートはまだありません。</p>
        ) : (
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {noteList.map((note) => (
              <button
                key={note.date}
                onClick={() => navigateTo(note.date)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                  note.date === date
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <p className="font-medium">{note.date}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {note.content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || "空"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Extraction review modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              aria-label="閉じる"
              className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm cursor-default"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="panel relative w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  抽出された条目（{selectedCount} 件選択中）
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="閉じる"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {candidates.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">
                    抽出できる表現が見つかりませんでした。
                  </p>
                ) : (
                  candidates.map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-3 transition-colors ${
                        c.selected
                          ? "border-violet-300 dark:border-violet-700"
                          : "border-slate-200 dark:border-slate-700 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={c.selected}
                          onChange={(e) =>
                            updateCandidate(i, { selected: e.target.checked })
                          }
                          className="accent-indigo-600"
                        />
                        <select
                          value={c.type}
                          onChange={(e) =>
                            updateCandidate(i, {
                              type: e.target.value as ExtractedEntry["type"],
                            })
                          }
                          className="field w-auto py-1 text-sm"
                        >
                          {TYPE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          value={c.japanese}
                          onChange={(e) =>
                            updateCandidate(i, { japanese: e.target.value })
                          }
                          placeholder="日本語"
                          className="field py-1 text-sm"
                        />
                        <input
                          value={c.reading ?? ""}
                          onChange={(e) =>
                            updateCandidate(i, { reading: e.target.value })
                          }
                          placeholder="読み"
                          className="field py-1 text-sm"
                        />
                        <input
                          value={c.meaning}
                          onChange={(e) =>
                            updateCandidate(i, { meaning: e.target.value })
                          }
                          placeholder="意味"
                          className="field py-1 text-sm"
                        />
                      </div>
                      <input
                        value={c.tags.join(", ")}
                        onChange={(e) =>
                          updateCandidate(i, {
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="タグ（カンマ区切り）"
                        className="field py-1 text-sm w-full mt-2"
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-3 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => setModalOpen(false)} className="btn-ghost">
                  キャンセル
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className="btn-primary"
                >
                  {importing ? "追加中..." : `${selectedCount} 件を追加`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
