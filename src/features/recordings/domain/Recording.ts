export interface Recording {
  id: string;
  filename: string;
  topic?: string;
  /** Folder-like category for organizing recordings. */
  category?: string;
  /** Reference video (e.g. YouTube URL) for shadowing comparison. Reserved for Phase C. */
  referenceUrl?: string;
  /**
   * Every study recording belongs to a video. Together with `clipId` and
   * `seg*` this distinguishes the three kinds:
   *   videoRef only            → retell (free recap of the whole video)
   *   videoRef + clipId        → whole-clip shadowing attempt
   *   videoRef + clipId + seg* → one sentence of repeat practice
   */
  videoRef?: string;
  clipId?: string;
  /** Sentence sub-segment (seconds within the clip) for repeat practice; unset = whole clip. */
  segStart?: number;
  segEnd?: number;
  tags: string[];
  created: string;
  duration?: number;
}
