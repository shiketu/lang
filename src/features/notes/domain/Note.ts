export interface Note {
  date: string;       // YYYY-MM-DD — unique key
  content: string;    // markdown body
  tags: string[];
  created: string;    // ISO datetime
  updated: string;    // ISO datetime
}
