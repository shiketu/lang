import fs from "fs/promises";
import path from "path";
import type { BlobRef, BlobStorageProvider } from "./interfaces";

const MIME_MAP: Record<string, string> = {
  webm: "video/webm",
  mp4: "video/mp4",
  ogg: "video/ogg",
};

export class LocalBlobStorage implements BlobStorageProvider {
  constructor(
    private baseDir: string,
    private urlPrefix: string
  ) {}

  private filePath(key: string): string {
    return path.join(this.baseDir, key);
  }

  async put(key: string, data: Buffer, contentType: string): Promise<BlobRef> {
    const fp = this.filePath(key);
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, data);
    return { key, size: data.length, contentType };
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    try {
      const data = await fs.readFile(this.filePath(key));
      const ext = path.extname(key).slice(1);
      const contentType = MIME_MAP[ext] ?? "application/octet-stream";
      return { data, contentType };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.filePath(key));
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return `${this.urlPrefix}/${key}`;
  }

  // Local disk can't sign URLs — callers fall back to streaming via get().
  async createSignedUrl(): Promise<string | null> {
    return null;
  }
}
