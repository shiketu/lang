// One line of pasted captions: start time in seconds + the text.
export interface TranscriptLine {
  t: number;
  text: string;
}

// A study video — the unit you navigate into. Clips, captions and recordings
// all hang off one of these.
export interface Video {
  id: string;
  videoId: string; // YouTube video id
  title: string;
  referenceUrl: string;
  category?: string;
  transcript?: TranscriptLine[];
  created: string;
}

export interface VideoRepository {
  list(): Promise<Video[]>;
  get(id: string): Promise<Video | null>;
  create(data: Omit<Video, "id" | "created">): Promise<Video>;
  update(id: string, data: Partial<Video>): Promise<Video | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
