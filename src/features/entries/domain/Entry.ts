export type EntryType = "vocabulary" | "expression" | "sentence";

// How you intend to use the item.
export type Purpose = "memorize" | "ready" | "pattern" | "frequent";

// Register / social setting, ordered from formal to casual.
export type Register = "business" | "casual-business" | "casual" | "daily";

export interface EntryFilter {
  type?: EntryType;
  purpose?: Purpose;
  register?: Register;
  tag?: string;
  query?: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  purpose?: Purpose;
  register?: Register;
  japanese: string;
  reading?: string;
  meaning: string;
  tags: string[];
  created: string;
  updated: string;
  content: string;
}
