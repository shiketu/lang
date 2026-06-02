import type { EntryType } from "@/features/entries/domain/Entry";

export interface ExtractedEntry {
  type: EntryType;
  japanese: string;
  reading?: string;
  meaning: string;
  tags: string[];
}
