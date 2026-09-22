import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Clip, ClipRepository } from "../domain/Clip";

interface StoreData {
  clips: Clip[];
}

export class JsonClipRepository implements ClipRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return { clips: Array.isArray(data.clips) ? data.clips : [] };
    } catch {
      return { clips: [] };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async list(videoRef?: string): Promise<Clip[]> {
    const data = await this.read();
    const rows = videoRef
      ? data.clips.filter((c) => c.videoRef === videoRef)
      : data.clips;
    return [...rows].sort((a, b) => a.segmentStart - b.segmentStart);
  }

  async get(id: string): Promise<Clip | null> {
    const data = await this.read();
    return data.clips.find((c) => c.id === id) ?? null;
  }

  async create(input: Omit<Clip, "id" | "created">): Promise<Clip> {
    const data = await this.read();
    const clip: Clip = {
      ...input,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    data.clips.push(clip);
    await this.write(data);
    return clip;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.read();
    const before = data.clips.length;
    data.clips = data.clips.filter((c) => c.id !== id);
    if (data.clips.length === before) return false;
    await this.write(data);
    return true;
  }

  async count(): Promise<number> {
    const data = await this.read();
    return data.clips.length;
  }
}
