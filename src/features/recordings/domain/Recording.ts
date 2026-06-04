export interface Recording {
  id: string;
  filename: string;
  topic?: string;
  /** Folder-like category for organizing recordings. */
  category?: string;
  tags: string[];
  created: string;
  duration?: number;
}
