import type { EntryType } from "./Entry";

/** A candidate entry the LLM pulled out of pasted/uploaded notes, pending review. */
export interface ExtractedEntry {
  type: EntryType;
  japanese: string;
  reading?: string;
  meaning: string;
  tags: string[];
}
