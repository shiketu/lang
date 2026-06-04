import fs from "fs/promises";
import path from "path";
import type {
  ActivityKind,
  ActivityLog,
  ActivityRepository,
} from "../domain/Activity";

interface StoreData {
  logs: ActivityLog[];
}

export class JsonActivityRepository implements ActivityRepository {
  constructor(private filePath: string) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      return { logs: Array.isArray(data.logs) ? data.logs : [] };
    } catch {
      return { logs: [] };
    }
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async log(date: string, kind: ActivityKind, count = 1): Promise<void> {
    const data = await this.read();
    const row = data.logs.find((l) => l.date === date && l.kind === kind);
    if (row) row.count += count;
    else data.logs.push({ date, kind, count });
    await this.write(data);
  }

  async range(from: string, to: string): Promise<ActivityLog[]> {
    const data = await this.read();
    return data.logs.filter((l) => l.date >= from && l.date <= to);
  }

  async forDate(date: string): Promise<ActivityLog[]> {
    const data = await this.read();
    return data.logs.filter((l) => l.date === date);
  }
}
