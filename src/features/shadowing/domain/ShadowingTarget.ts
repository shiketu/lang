// A reference clip segment the user repeatedly shadows. Each practice recording
// (a normal Recording with shadowingTargetId set) hangs off one target.
export interface ShadowingTarget {
  id: string;
  referenceUrl: string;
  videoId: string; // YouTube video id
  title: string;
  segmentStart: number; // seconds
  segmentEnd: number; // seconds
  category?: string;
  created: string;
}

export interface ShadowingTargetRepository {
  list(): Promise<ShadowingTarget[]>;
  get(id: string): Promise<ShadowingTarget | null>;
  create(
    data: Omit<ShadowingTarget, "id" | "created">
  ): Promise<ShadowingTarget>;
  delete(id: string): Promise<boolean>;
}
