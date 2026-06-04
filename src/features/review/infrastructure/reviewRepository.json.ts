import fs from "fs/promises";
import path from "path";
import type { Reviewable, ReviewKind } from "../domain/Reviewable";
import type { ReviewRepository } from "../domain/ReviewRepository";

interface StoreData {
  items: Reviewable[];
}

export class JsonReviewRepository implements ReviewRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return { items: Array.isArray(data.items) ? data.items : [] };
    } catch {
      return { items: [] };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async listDue(today: string, limit = 50): Promise<Reviewable[]> {
    const data = await this.read();
    return data.items
      .filter((i) => i.due <= today)
      .sort((a, b) => a.due.localeCompare(b.due))
      .slice(0, limit);
  }

  async get(kind: ReviewKind, refId: string): Promise<Reviewable | null> {
    const data = await this.read();
    return data.items.find((i) => i.kind === kind && i.refId === refId) ?? null;
  }

  async enqueue(kind: ReviewKind, refId: string, due: string): Promise<void> {
    const data = await this.read();
    if (data.items.some((i) => i.kind === kind && i.refId === refId)) return;
    data.items.push({
      kind,
      refId,
      ease: 2.5,
      intervalDays: 0,
      repetitions: 0,
      due,
      created: new Date().toISOString(),
    });
    await this.write(data);
  }

  async save(item: Reviewable): Promise<void> {
    const data = await this.read();
    const idx = data.items.findIndex(
      (i) => i.kind === item.kind && i.refId === item.refId
    );
    if (idx >= 0) data.items[idx] = item;
    else data.items.push(item);
    await this.write(data);
  }

  async dueCount(today: string): Promise<number> {
    const data = await this.read();
    return data.items.filter((i) => i.due <= today).length;
  }
}
