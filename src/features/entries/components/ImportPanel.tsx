"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Upload, X, Trash2, Check } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import type { ExtractedEntry } from "@/features/entries/domain/ExtractedEntry";
import type { EntryType } from "@/features/entries/domain/Entry";

type Candidate = ExtractedEntry & { selected: boolean };

const TYPE_VALUES: EntryType[] = ["vocabulary", "expression", "sentence"];

/** Paste or upload notes → LLM extracts entry candidates → review → bulk import. */
export default function ImportPanel() {
  const dict = useDict();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setContent((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${text}` : text));
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleExtract() {
    if (!content.trim()) return;
    setExtracting(true);
    setError("");
    const res = await apiFetch("/entries/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setExtracting(false);
    if (!res.ok) {
      setError(dict.imports.extractFailed);
      return;
    }
    const items: ExtractedEntry[] = await res.json();
    setCandidates(items.map((c) => ({ ...c, selected: true })));
    setModalOpen(true);
  }

  function updateCandidate(index: number, patch: Partial<Candidate>) {
    setCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  async function handleImport() {
    const selected = candidates
      .filter((c) => c.selected)
      .map(({ selected: _selected, ...c }) => c);
    if (selected.length === 0) return;
    setImporting(true);
    const res = await apiFetch("/entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: selected }),
    });
    setImporting(false);
    if (res.ok) {
      const data = await res.json();
      setModalOpen(false);
      setCandidates([]);
      setContent("");
      setImported(data.count ?? 0);
    }
  }

  const selectedCount = candidates.filter((c) => c.selected).length;

  return (
    <div className="max-w-3xl space-y-4">
      {imported > 0 && (
        <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {fmt(dict.imports.importedAlert, { count: imported })}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {dict.imports.sourceLabel}
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            {fmt(dict.imports.charCount, { n: content.length })}
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setImported(0);
          }}
          rows={14}
          className="field resize-y font-mono text-sm"
          placeholder={dict.imports.placeholder}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-4 h-4" />
            {dict.imports.uploadFile}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleFile}
            className="hidden"
          />
          {content && (
            <button onClick={() => setContent("")} className="btn-ghost">
              <Trash2 className="w-4 h-4" />
              {dict.imports.clear}
            </button>
          )}
        </div>

        <button
          onClick={handleExtract}
          disabled={extracting || !content.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Sparkles className="w-4 h-4" />
          {extracting ? dict.imports.extracting : dict.imports.extract}
        </button>
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
              aria-label={dict.common.close}
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
                  {fmt(dict.imports.modalTitle, { n: selectedCount })}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label={dict.common.close}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {candidates.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">{dict.imports.noCandidates}</p>
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
                          onChange={(e) => updateCandidate(i, { selected: e.target.checked })}
                          className="accent-indigo-600"
                        />
                        <select
                          value={c.type}
                          onChange={(e) =>
                            updateCandidate(i, { type: e.target.value as EntryType })
                          }
                          className="field w-auto py-1 text-sm"
                        >
                          {TYPE_VALUES.map((v) => (
                            <option key={v} value={v}>
                              {dict.entryMeta.type[v]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          value={c.japanese}
                          onChange={(e) => updateCandidate(i, { japanese: e.target.value })}
                          placeholder={dict.imports.fieldJapanese}
                          className="field text-sm"
                        />
                        <input
                          value={c.reading ?? ""}
                          onChange={(e) => updateCandidate(i, { reading: e.target.value })}
                          placeholder={dict.imports.fieldReading}
                          className="field text-sm"
                        />
                        <input
                          value={c.meaning}
                          onChange={(e) => updateCandidate(i, { meaning: e.target.value })}
                          placeholder={dict.imports.fieldMeaning}
                          className="field text-sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button onClick={() => setModalOpen(false)} className="btn-ghost">
                  {dict.common.cancel}
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className="btn-primary disabled:opacity-50"
                >
                  {importing ? dict.imports.importing : dict.imports.import}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
