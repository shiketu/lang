import { noteRepository, llm } from "@/composition";
import type { EntryType } from "@/features/entries/domain/Entry";
import type { ExtractedEntry } from "../domain/ExtractedEntry";

const VALID_TYPES: EntryType[] = ["vocabulary", "expression", "sentence"];

export async function extractEntriesFromNote(
  date: string
): Promise<ExtractedEntry[]> {
  const note = await noteRepository.get(date);
  if (!note || !note.content.trim()) return [];

  const prompt = `あなたは日本語学習アシスタントです。以下は学習者が書いた日本語学習ノート（Markdown）です。
このノートから、学習価値のある日本語の「単語・表現・例文」を抽出してください。

出力は必ず JSON 配列のみ（説明文なし）。各要素は次の形式：
{
  "type": "vocabulary" | "expression" | "sentence",
  "japanese": "日本語の語句",
  "reading": "ひらがなの読み（あれば）",
  "meaning": "中国語（簡体字）の意味",
  "tags": ["関連タグ"]
}

ルール：
- type は単語なら vocabulary、慣用表現なら expression、文なら sentence
- meaning は中国語（簡体字）で簡潔に
- reading は漢字を含む場合のみ。なければ空文字
- 抽出対象がなければ空配列 []
- JSON 以外は一切出力しない

--- ノート本文 ---
${note.content}
--- ここまで ---`;

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
