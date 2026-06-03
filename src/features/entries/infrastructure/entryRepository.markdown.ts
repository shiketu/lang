import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { readAllMarkdownFiles, writeMarkdownFile } from "@/lib/storage/markdown";
import { toEntry, toFrontmatter } from "./entryMapper.markdown";
import type { Entry, EntryType, EntryFilter } from "../domain/Entry";
import type { EntryRepository } from "../domain/EntryRepository";

export interface MarkdownEntryRepositoryConfig {
  typeDirs: Record<string, string>;
  fallbackDir: string;
}

function slugify(japanese: string, id: string): string {
  const safe = japanese.replace(/[^\p{L}\p{N}]/gu, "_").slice(0, 40);
  return `${safe}_${id.slice(0, 8)}`;
}

function matchesFilter(entry: Entry, filter: EntryFilter): boolean {
  if (filter.type && entry.type !== filter.type) return false;
  if (filter.purpose && entry.purpose !== filter.purpose) return false;
  if (filter.register && entry.register !== filter.register) return false;
  if (filter.tag && !entry.tags.includes(filter.tag)) return false;
  if (filter.query) {
    const q = filter.query.toLowerCase();
    const hit =
      entry.japanese.toLowerCase().includes(q) ||
      (entry.reading?.toLowerCase().includes(q) ?? false) ||
      entry.meaning.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q)) ||
      entry.content.toLowerCase().includes(q);
    if (!hit) return false;
  }
  return true;
}

export class MarkdownEntryRepository implements EntryRepository {
  private pathIndex = new Map<string, string>();

  constructor(private config: MarkdownEntryRepositoryConfig) {}

  private dirForType(type: EntryType): string {
    return this.config.typeDirs[type] ?? this.config.fallbackDir;
  }

  private async readAllDocs(): Promise<{ entry: Entry; filePath: string }[]> {
    const dirs = new Set(Object.values(this.config.typeDirs));
    const batches = await Promise.all(
      Array.from(dirs).map((dir) => readAllMarkdownFiles(dir))
    );
    const docs = batches.flat();
    const results: { entry: Entry; filePath: string }[] = [];
    for (const doc of docs) {
      const entry = toEntry(doc);
      this.pathIndex.set(entry.id, doc.filePath);
      results.push({ entry, filePath: doc.filePath });
    }
    return results;
  }

  async list(filter?: EntryFilter): Promise<Entry[]> {
    let docs: { entry: Entry; filePath: string }[];

    if (filter?.type && !filter.query) {
      const raw = await readAllMarkdownFiles(this.dirForType(filter.type));
      docs = raw.map((doc) => {
        const entry = toEntry(doc);
        this.pathIndex.set(entry.id, doc.filePath);
        return { entry, filePath: doc.filePath };
      });
    } else {
      docs = await this.readAllDocs();
    }

    let entries = docs.map((d) => d.entry);

    if (filter) {
      entries = entries.filter((e) => matchesFilter(e, filter));
    }

    return entries.sort((a, b) => b.created.localeCompare(a.created));
  }

  async get(id: string): Promise<Entry | null> {
    const all = await this.readAllDocs();
    return all.find((d) => d.entry.id === id)?.entry ?? null;
  }

  async create(data: Omit<Entry, "id" | "created" | "updated">): Promise<Entry> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split("T")[0];
    const entry: Entry = {
      ...data,
      id,
      tags: data.tags ?? [],
      created: now,
      updated: now,
    };
    const slug = slugify(entry.japanese, id);
    const dir = this.dirForType(entry.type);
    const filePath = path.join(dir, `${slug}.md`);
    await writeMarkdownFile(filePath, toFrontmatter(entry), entry.content);
    this.pathIndex.set(id, filePath);
    return entry;
  }

  async update(id: string, data: Partial<Entry>): Promise<Entry | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const filePath = this.pathIndex.get(id);
    if (!filePath) return null;

    const now = new Date().toISOString().split("T")[0];
    const updated: Entry = { ...existing, ...data, updated: now };
    await writeMarkdownFile(filePath, toFrontmatter(updated), updated.content);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.get(id);
    const filePath = this.pathIndex.get(id);
    if (!filePath) return false;
    try {
      await fs.unlink(filePath);
      this.pathIndex.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  async getAllTags(): Promise<string[]> {
    const all = await this.readAllDocs();
    const tagSet = new Set<string>();
    for (const { entry } of all) {
      for (const t of entry.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }
}
