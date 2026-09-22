import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Video, VideoRepository } from "../domain/Video";

interface StoreData {
  videos: Video[];
}

export class JsonVideoRepository implements VideoRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return { videos: Array.isArray(data.videos) ? data.videos : [] };
    } catch {
      return { videos: [] };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async list(): Promise<Video[]> {
    const data = await this.read();
    return [...data.videos].sort((a, b) => b.created.localeCompare(a.created));
  }

  async get(id: string): Promise<Video | null> {
    const data = await this.read();
    return data.videos.find((v) => v.id === id) ?? null;
  }

  async create(input: Omit<Video, "id" | "created">): Promise<Video> {
    const data = await this.read();
    const video: Video = {
      ...input,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    data.videos.push(video);
    await this.write(data);
    return video;
  }

  async update(id: string, patch: Partial<Video>): Promise<Video | null> {
    const data = await this.read();
    const i = data.videos.findIndex((v) => v.id === id);
    if (i === -1) return null;
    data.videos[i] = { ...data.videos[i], ...patch, id, created: data.videos[i].created };
    await this.write(data);
    return data.videos[i];
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.read();
    const before = data.videos.length;
    data.videos = data.videos.filter((v) => v.id !== id);
    if (data.videos.length === before) return false;
    await this.write(data);
    return true;
  }

  async count(): Promise<number> {
    const data = await this.read();
    return data.videos.length;
  }
}
