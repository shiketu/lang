export interface Recording {
  id: string;
  filename: string;
  topic?: string;
  /** Folder-like category for organizing recordings. */
  category?: string;
  /** Reference video (e.g. YouTube URL) for shadowing comparison. Reserved for Phase C. */
  referenceUrl?: string;
  /** When set, this recording is a shadowing practice attempt for that target. */
  shadowingTargetId?: string;
  tags: string[];
  created: string;
  duration?: number;
}
