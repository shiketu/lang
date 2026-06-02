import type { Recording } from "./Recording";

export interface RecordingRepository {
  list(): Promise<Recording[]>;
  get(id: string): Promise<Recording | null>;
  save(
    file: File,
    meta: { topic?: string; tags?: string[] }
  ): Promise<Recording>;
  getBlob(
    id: string
  ): Promise<{ data: Buffer; contentType: string } | null>;
  delete(id: string): Promise<boolean>;
}
