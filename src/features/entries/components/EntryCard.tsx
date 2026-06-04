"use client";

import Link from "next/link";
import TagBadge from "@/components/TagBadge";
import type { Entry } from "../domain/Entry";
import {
  TYPE_LABEL,
  TYPE_BADGE,
  PURPOSE_LABEL,
  PURPOSE_BADGE,
  REGISTER_LABEL,
  REGISTER_BADGE,
} from "./entryMeta";

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      href={`/lakehouse/${entry.id}`}
      className="card card-interactive block p-4 animate-fade-in-up hover:border-indigo-300 dark:hover:border-indigo-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold truncate">{entry.japanese}</p>
          {entry.reading && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{entry.reading}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {entry.meaning}
          </p>
        </div>
        <Badge
          label={TYPE_LABEL[entry.type] ?? entry.type}
          cls={TYPE_BADGE[entry.type] ?? ""}
        />
      </div>

      {(entry.purpose || entry.register) && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.purpose && (
            <Badge label={PURPOSE_LABEL[entry.purpose]} cls={PURPOSE_BADGE[entry.purpose]} />
          )}
          {entry.register && (
            <Badge label={REGISTER_LABEL[entry.register]} cls={REGISTER_BADGE[entry.register]} />
          )}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
