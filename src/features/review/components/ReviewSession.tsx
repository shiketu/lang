"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Mic,
  Video as VideoIcon,
  Eye,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import YouTubePlayer from "@/features/shadowing/components/YouTubePlayer";
import { SM2_GRADES } from "@/lib/sm2";
import type { Reviewable, ReviewKind } from "../domain/Reviewable";
import type { Entry } from "@/features/entries/domain/Entry";
import type { Recording } from "@/features/recordings/domain/Recording";
import type { ShadowingTarget } from "@/features/shadowing/domain/ShadowingTarget";

type ReviewItem = Reviewable & {
  entry?: Entry;
  recording?: Recording;
  target?: ShadowingTarget;
};

const KIND_META: Record<ReviewKind, { icon: typeof BrainCircuit; color: string }> = {
  entry: { icon: BrainCircuit, color: "text-blue-600 dark:text-blue-400" },
  practice: { icon: Mic, color: "text-violet-600 dark:text-violet-400" },
  video: { icon: VideoIcon, color: "text-rose-600 dark:text-rose-400" },
  shadowing: { icon: Mic, color: "text-violet-600 dark:text-violet-400" },
};

export default function ReviewSession() {
  const ws = useWs();
  const dict = useDict();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  // per-item interaction state
  const [revealed, setRevealed] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    apiFetch("/review")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const kindLabels: Record<ReviewKind, string> = {
    entry: dict.review.kindEntry,
    practice: dict.review.kindPractice,
    video: dict.review.kindVideo,
    shadowing: dict.review.kindShadowing,
  };
  const grades = [
    { label: dict.review.gradeAgain, q: SM2_GRADES.again, cls: "bg-rose-600 hover:bg-rose-700" },
    { label: dict.review.gradeHard, q: SM2_GRADES.hard, cls: "bg-amber-500 hover:bg-amber-600" },
    { label: dict.review.gradeGood, q: SM2_GRADES.good, cls: "bg-indigo-600 hover:bg-indigo-700" },
    { label: dict.review.gradeEasy, q: SM2_GRADES.easy, cls: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  const total = items.length;
  const current = items[idx];

  function resetItem() {
    setRevealed(false);
    setUserInput("");
    setAnalysis("");
    setComparing(false);
  }

  async function grade(quality: number) {
    if (!current) return;
    await apiFetch("/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: current.kind, refId: current.refId, quality }),
    });
    resetItem();
    setIdx((i) => i + 1);
  }

  async function runCompare() {
    if (!current?.entry || !userInput.trim()) return;
    setComparing(true);
    const res = await apiFetch("/practice/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        original: current.entry.japanese,
        userInput: userInput.trim(),
        meaning: current.entry.meaning,
        entryId: current.entry.id,
      }),
    });
    const data = await res.json();
    setAnalysis(data.analysis ?? "");
    setComparing(false);
    setRevealed(true);
  }

  if (loading) {
    return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />;
  }

  if (total === 0 || idx >= total) {
    return (
      <div className="card p-10 text-center">
        <PartyPopper className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {total === 0 ? dict.review.emptyTitle : dict.review.doneTitle}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {total === 0 ? dict.review.emptyDesc : dict.review.doneDesc}
        </p>
        <Link href={`/${ws}`} className="btn-primary inline-flex">
          {dict.review.backHome}
        </Link>
      </div>
    );
  }

  const meta = KIND_META[current.kind];
  const Icon = meta.icon;
  const pct = Math.round((idx / total) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className={`flex items-center gap-2 font-medium ${meta.color}`}>
            <Icon className="w-4 h-4" />
            {kindLabels[current.kind]}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {idx + 1} / {total}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.kind}-${current.refId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          {/* ENTRY — recall */}
          {current.kind === "entry" && current.entry && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{dict.review.recallPrompt}</p>
                <p className="text-xl font-medium text-slate-800 dark:text-slate-100">
                  {current.entry.meaning}
                </p>
              </div>
              {!revealed ? (
                <button onClick={() => setRevealed(true)} className="btn-ghost border border-slate-200 dark:border-slate-700">
                  <Eye className="w-4 h-4" />
                  {dict.review.reveal}
                </button>
              ) : (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {current.entry.japanese}
                  </p>
                  {current.entry.reading && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{current.entry.reading}</p>
                  )}
                  {current.entry.content && (
                    <div className="mt-3 text-sm">
                      <MarkdownRenderer content={current.entry.content} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PRACTICE — production + LLM */}
          {current.kind === "practice" && current.entry && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{dict.review.producePrompt}</p>
                <p className="text-xl font-medium text-slate-800 dark:text-slate-100">
                  {current.entry.meaning}
                </p>
              </div>
              {!revealed ? (
                <>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={3}
                    className="field resize-y"
                    placeholder={dict.review.inputPlaceholder}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={runCompare}
                      disabled={comparing || !userInput.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 active:scale-[.98] disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {comparing ? dict.review.analyzing : dict.review.aiAnalyze}
                    </button>
                    <button onClick={() => setRevealed(true)} className="btn-ghost">
                      <Eye className="w-4 h-4" />
                      {dict.review.reveal}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <p className="text-xs text-slate-400 mb-1">{dict.review.modelExpr}</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {current.entry.japanese}
                    </p>
                    {current.entry.reading && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{current.entry.reading}</p>
                    )}
                  </div>
                  {analysis && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm">
                      <MarkdownRenderer content={analysis} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIDEO — re-watch / re-record */}
          {current.kind === "video" && current.recording && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{dict.review.videoPrompt}</p>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {current.recording.topic || dict.review.untitledVideo}
                </p>
                <p className="text-xs text-slate-400">
                  {fmt(dict.review.recordedOn, {
                    date: new Date(current.recording.created).toLocaleDateString(
                      ws === "en" ? "en-US" : "ja-JP"
                    ),
                  })}
                </p>
              </div>
              <video
                src={`/api/${ws}/recordings/${current.recording.id}`}
                controls
                playsInline
                className="w-full rounded-xl"
              />
              <Link href={`/${ws}/video`} className="btn-ghost inline-flex border border-slate-200 dark:border-slate-700">
                <VideoIcon className="w-4 h-4" />
                {dict.review.recordAgain}
              </Link>
            </div>
          )}

          {/* SHADOWING — re-practice a clip segment */}
          {current.kind === "shadowing" && current.target && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{dict.review.shadowingPrompt}</p>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {current.target.title}
                </p>
              </div>
              <YouTubePlayer
                videoId={current.target.videoId}
                start={current.target.segmentStart}
                end={current.target.segmentEnd}
                loop
                className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
              />
              <Link
                href={`/${ws}/shadowing?target=${current.target.id}`}
                className="btn-ghost inline-flex border border-slate-200 dark:border-slate-700"
              >
                <Mic className="w-4 h-4" />
                {dict.review.practiceAgain}
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Grade buttons — entry/practice need reveal first; video/shadowing always available */}
      {(current.kind === "video" || current.kind === "shadowing" || revealed) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grades.map((g) => (
            <button
              key={g.label}
              onClick={() => grade(g.q)}
              className={`py-2.5 rounded-xl text-white text-sm font-medium transition-all active:scale-[.98] ${g.cls}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
