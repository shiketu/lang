import type { EntryType, Purpose, Register } from "../domain/Entry";

export interface MetaOption<T> {
  value: T;
  label: string;
  /** Tailwind classes for a badge/chip (light + dark). */
  badge: string;
}

export const TYPE_OPTIONS: MetaOption<EntryType>[] = [
  { value: "vocabulary", label: "単語", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "expression", label: "表現", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  { value: "sentence", label: "例文", badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
];

export const PURPOSE_OPTIONS: MetaOption<Purpose>[] = [
  { value: "memorize", label: "覚えるだけ", badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "ready", label: "そのまま使う", badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  { value: "pattern", label: "パターン・日本語ロジック", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "frequent", label: "よく使う", badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
];

// Ordered formal → casual.
export const REGISTER_OPTIONS: MetaOption<Register>[] = [
  { value: "business", label: "ビジネス", badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { value: "casual-business", label: "カジュアルビジネス", badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  { value: "casual", label: "カジュアル", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { value: "daily", label: "日常会話", badge: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300" },
];

export const TYPE_LABEL: Record<EntryType, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<EntryType, string>;
export const PURPOSE_LABEL: Record<Purpose, string> = Object.fromEntries(
  PURPOSE_OPTIONS.map((o) => [o.value, o.label])
) as Record<Purpose, string>;
export const REGISTER_LABEL: Record<Register, string> = Object.fromEntries(
  REGISTER_OPTIONS.map((o) => [o.value, o.label])
) as Record<Register, string>;

export const TYPE_BADGE: Record<EntryType, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.badge])
) as Record<EntryType, string>;
export const PURPOSE_BADGE: Record<Purpose, string> = Object.fromEntries(
  PURPOSE_OPTIONS.map((o) => [o.value, o.badge])
) as Record<Purpose, string>;
export const REGISTER_BADGE: Record<Register, string> = Object.fromEntries(
  REGISTER_OPTIONS.map((o) => [o.value, o.badge])
) as Record<Register, string>;
