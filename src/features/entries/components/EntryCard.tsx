"use client";

import Link from "next/link";
import TagBadge from "@/components/TagBadge";
import type { Entry } from "../domain/Entry";

const TYPE_LABELS: Record<string, string> = {
  vocabulary: "単語",
  expression: "表現",
  sentence: "例文",
};

export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      href={`/lakehouse/${entry.id}`}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold truncate">{entry.japanese}</p>
          {entry.reading && (
            <p className="text-sm text-gray-500">{entry.reading}</p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {entry.meaning}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
          {TYPE_LABELS[entry.type] ?? entry.type}
        </span>
      </div>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
