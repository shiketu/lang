import { llm } from "@/composition";
import { getWorkspace } from "@/lib/workspace";
import { getDictionary, fmt } from "@/i18n";
import type { EntryType } from "../domain/Entry";
import type { ExtractedEntry } from "../domain/ExtractedEntry";

const VALID_TYPES: EntryType[] = ["vocabulary", "expression", "sentence"];

/** Runs the LLM extraction prompt over pasted/uploaded notes. */
export async function extractEntriesFromText(
  content: string
): Promise<ExtractedEntry[]> {
  if (!content.trim()) return [];

  const dict = getDictionary(getWorkspace());
  const prompt = fmt(dict.prompts.extract, { content });

  const raw = await llm.generateText(prompt, 2048);
  return parseCandidates(raw);
}

function parseCandidates(raw: string): ExtractedEntry[] {
  let text = raw.trim();

  // strip ```json ... ``` code fences if present
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  // isolate the JSON array
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const result: ExtractedEntry[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const japanese = String(o.japanese ?? "").trim();
    const meaning = String(o.meaning ?? "").trim();
    if (!japanese) continue;

    const type = VALID_TYPES.includes(o.type as EntryType)
      ? (o.type as EntryType)
      : "vocabulary";
    const reading = o.reading != null ? String(o.reading).trim() : "";
    const tags = Array.isArray(o.tags) ? o.tags.map(String) : [];

    result.push({
      type,
      japanese,
      reading: reading || undefined,
      meaning,
      tags,
    });
  }
  return result;
}
