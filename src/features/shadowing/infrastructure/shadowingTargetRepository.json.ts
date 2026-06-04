import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type {
  ShadowingTarget,
  ShadowingTargetRepository,
} from "../domain/ShadowingTarget";

interface StoreData {
  targets: ShadowingTarget[];
}

export class JsonShadowingTargetRepository implements ShadowingTargetRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return { targets: Array.isArray(data.targets) ? data.targets : [] };
    } catch {
      return { targets: [] };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async list(): Promise<ShadowingTarget[]> {
    const data = await this.read();
    return [...data.targets].sort((a, b) => b.created.localeCompare(a.created));
  }

  async get(id: string): Promise<ShadowingTarget | null> {
    const data = await this.read();
    return data.targets.find((t) => t.id === id) ?? null;
  }

  async create(
    input: Omit<ShadowingTarget, "id" | "created">
  ): Promise<ShadowingTarget> {
    const data = await this.read();
    const target: ShadowingTarget = {
      ...input,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    data.targets.push(target);
    await this.write(data);
    return target;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.read();
    const before = data.targets.length;
    data.targets = data.targets.filter((t) => t.id !== id);
    if (data.targets.length === before) return false;
    await this.write(data);
    return true;
  }
}
