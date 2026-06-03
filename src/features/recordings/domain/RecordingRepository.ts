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
  /**
   * Time-limited URL for the client to fetch the video directly (e.g. S3
   * presigned URL). Returns null when the backend can't sign (local disk).
   */
  getSignedUrl(id: string): Promise<string | null>;
  delete(id: string): Promise<boolean>;
}
