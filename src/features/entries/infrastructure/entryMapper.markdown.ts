import type { MarkdownDoc } from "@/lib/storage/markdown";
import type { Entry, EntryType } from "../domain/Entry";

export function toEntry(doc: MarkdownDoc): Entry {
  const fm = doc.frontmatter;
  return {
    id: String(fm.id ?? ""),
    type: (["vocabulary", "expression", "sentence"].includes(fm.type as string)
      ? fm.type
      : "vocabulary") as EntryType,
    japanese: String(fm.japanese ?? ""),
    reading: fm.reading != null ? String(fm.reading) : undefined,
    meaning: String(fm.meaning ?? ""),
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    source: fm.source != null ? String(fm.source) : undefined,
    level: fm.level as Entry["level"],
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
  if (entry.source != null) fm.source = entry.source;
  if (entry.level != null) fm.level = entry.level;
  return fm;
}
