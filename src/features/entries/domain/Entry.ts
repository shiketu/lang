export type EntryType = "vocabulary" | "expression" | "sentence";

export type Level = "beginner" | "intermediate" | "advanced";

export interface EntryFilter {
  type?: EntryType;
  tag?: string;
  query?: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  japanese: string;
  reading?: string;
  meaning: string;
  tags: string[];
  source?: string;
  level?: Level;
  created: string;
  updated: string;
  content: string;
}
