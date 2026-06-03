import type { MarkdownDoc } from "@/lib/storage/markdown";
import type { Entry, EntryType, Purpose, Register } from "../domain/Entry";

export function toEntry(doc: MarkdownDoc): Entry {
  const fm = doc.frontmatter;
  return {
    id: String(fm.id ?? ""),
    type: (["vocabulary", "expression", "sentence"].includes(fm.type as string)
      ? fm.type
      : "vocabulary") as EntryType,
    purpose: fm.purpose != null ? (fm.purpose as Purpose) : undefined,
    register: fm.register != null ? (fm.register as Register) : undefined,
    japanese: String(fm.japanese ?? ""),
    reading: fm.reading != null ? String(fm.reading) : undefined,
    meaning: String(fm.meaning ?? ""),
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    created: String(fm.created ?? ""),
    updated: String(fm.updated ?? ""),
    content: doc.content,
  };
}

export function toFrontmatter(entry: Entry): Record<string, unknown> {
  const fm: Record<string, unknown> = {
    id: entry.id,
    type: entry.type,
    japanese: entry.japanese,
    meaning: entry.meaning,
    tags: entry.tags,
    created: entry.created,
    updated: entry.updated,
  };
  if (entry.reading != null) fm.reading = entry.reading;
  if (entry.purpose != null) fm.purpose = entry.purpose;
  if (entry.register != null) fm.register = entry.register;
  return fm;
}
