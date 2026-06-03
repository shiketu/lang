"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Entry } from "@/features/entries/domain/Entry";

type Phase = "loading" | "prompt" | "input" | "comparing" | "result";

export default function PracticeSession() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [current, setCurrent] = useState<Entry | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [userInput, setUserInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterType, setFilterType] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  async function loadEntries() {
    const params = new URLSearchParams();
    if (filterTag) params.set("tag", filterTag);
    if (filterType) params.set("type", filterType);
    const res = await fetch(`/api/entries?${params}`);
    const data: Entry[] = await res.json();
    setEntries(data);
    return data;
  }

  async function pickRandom() {
    setPhase("loading");
    setUserInput("");
    setAnalysis("");
    const data = entries.length > 0 ? entries : await loadEntries();
    if (data.length === 0) {
      setPhase("prompt");
      setCurrent(null);
      return;
    }
    const idx = Math.floor(Math.random() * data.length);
    setCurrent(data[idx]);
    setPhase("prompt");
  }

  async function submitAnswer() {
    if (!current || !userInput.trim()) return;
    setPhase("comparing");

    const res = await fetch("/api/practice/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        original: current.japanese,
        userInput: userInput.trim(),
        meaning: current.meaning,
      }),
    });
    const data = await res.json();
    setAnalysis(data.analysis);
    setPhase("result");
  }

  function skipToReveal() {
    setPhase("result");
    setAnalysis("");
  }

  if (phase === "loading" && !current) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">種類で絞り込み</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">全て</option>
              <option value="vocabulary">単語</option>
              <option value="expression">表現</option>
              <option value="sentence">例文</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">タグで絞り込み</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">全て</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={pickRandom}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            練習を始める
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {phase === "loading" && (
        <p className="text-gray-500">読み込み中...</p>
      )}

      {phase === "prompt" && !current && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">言語データにエントリーがありません。</p>
          <a href="/lakehouse" className="text-blue-600 hover:underline">
            まずエントリーを追加しましょう
          </a>
        </div>
      )}

      {phase === "prompt" && current && (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-2">次の意味を日本語で表現してください：</p>
            <p className="text-xl font-medium">{current.meaning}</p>
            {current.reading && (
              <p className="text-sm text-gray-400 mt-2">
                ヒント：{current.type === "vocabulary" ? "単語" : "表現"}
              </p>
            )}
          </div>
          <div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
              placeholder="あなたの日本語表現を入力..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setPhase("input");
                }
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPhase("input")}
              disabled={!userInput.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              確認する
            </button>
            <button
              onClick={skipToReveal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
            >
              答えを見る
            </button>
          </div>
        </div>
      )}

      {phase === "input" && current && (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-1">意味：</p>
            <p className="text-lg">{current.meaning}</p>
            <p className="text-sm text-gray-500 mt-3 mb-1">あなたの表現：</p>
            <p className="text-lg font-medium">{userInput}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={submitAnswer}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              LLM分析を依頼する
            </button>
            <button
              onClick={skipToReveal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
            >
              分析なしで答えを見る
            </button>
          </div>
        </div>
      )}

      {phase === "comparing" && (
        <div className="text-center py-8">
          <p className="text-gray-500">分析中...</p>
        </div>
      )}

      {phase === "result" && current && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">元の表現：</p>
              <p className="text-lg font-bold">{current.japanese}</p>
              {current.reading && (
                <p className="text-sm text-gray-500">{current.reading}</p>
              )}
            </div>
            {userInput && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">あなたの表現：</p>
                <p className="text-lg font-bold">{userInput}</p>
              </div>
            )}
          </div>

          {analysis && (
            <div className="border rounded-lg p-6 dark:border-gray-700">
              <MarkdownRenderer content={analysis} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={pickRandom}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              次の問題
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
