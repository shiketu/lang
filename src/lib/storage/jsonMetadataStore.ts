import fs from "fs/promises";
import path from "path";
import type { MetadataStore } from "./interfaces";

export class JsonMetadataStore<T extends { id: string }> implements MetadataStore<T> {
  constructor(private filePath: string) {}

  private async read(): Promise<T[]> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private async write(items: T[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), "utf-8");
  }

  async list(): Promise<T[]> {
    return this.read();
  }

  async get(id: string): Promise<T | null> {
    const items = await this.read();
    return items.find((item) => item.id === id) ?? null;
  }

  async put(item: T): Promise<void> {
    const items = await this.read();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.unshift(item);
    }
    await this.write(items);
  }

  async remove(id: string): Promise<boolean> {
    const items = await this.read();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.write(filtered);
    return true;
  }
}
