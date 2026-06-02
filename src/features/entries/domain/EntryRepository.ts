import type { Entry, EntryFilter } from "./Entry";

export interface EntryRepository {
  list(filter?: EntryFilter): Promise<Entry[]>;
  get(id: string): Promise<Entry | null>;
  create(data: Omit<Entry, "id" | "created" | "updated">): Promise<Entry>;
  update(id: string, data: Partial<Entry>): Promise<Entry | null>;
  delete(id: string): Promise<boolean>;
  getAllTags(): Promise<string[]>;
}
