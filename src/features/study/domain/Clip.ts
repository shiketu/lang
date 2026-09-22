// A practice segment inside one video. Each practice recording (a Recording
// with clipId set) hangs off one clip.
export interface Clip {
  id: string;
  videoRef: string; // Video.id
  title: string;
  segmentStart: number; // seconds
  segmentEnd: number; // seconds
  created: string;
}

export interface ClipRepository {
  /** All clips, or only those belonging to one video. */
  list(videoRef?: string): Promise<Clip[]>;
  get(id: string): Promise<Clip | null>;
  create(data: Omit<Clip, "id" | "created">): Promise<Clip>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
