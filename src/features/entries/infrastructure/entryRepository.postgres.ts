import crypto from "crypto";
import { eq, and, or, ilike, desc, arrayContains, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { entries } from "@/lib/db/schema";
import type { Entry, EntryFilter } from "../domain/Entry";
import type { EntryRepository } from "../domain/EntryRepository";

type Row = typeof entries.$inferSelect;

function toEntry(row: Row): Entry {
  return {
    id: row.id,
    type: row.type,
    purpose: row.purpose ?? undefined,
    register: row.register ?? undefined,
    japanese: row.japanese,
    reading: row.reading ?? undefined,
    meaning: row.meaning,
    tags: row.tags ?? [],
    created: row.created,
    updated: row.updated,
    content: row.content,
  };
}

export class PostgresEntryRepository implements EntryRepository {
  constructor(private ws: Workspace = "ja") {}

  async list(filter?: EntryFilter): Promise<Entry[]> {
    const db = getDb(this.ws);
    const conds: SQL[] = [];

    if (filter?.type) conds.push(eq(entries.type, filter.type));
    if (filter?.purpose) conds.push(eq(entries.purpose, filter.purpose));
    if (filter?.register) conds.push(eq(entries.register, filter.register));
    if (filter?.tag) conds.push(arrayContains(entries.tags, [filter.tag]));
    if (filter?.query) {
      const q = `%${filter.query}%`;
      const search = or(
        ilike(entries.japanese, q),
        ilike(entries.reading, q),
        ilike(entries.meaning, q),
        ilike(entries.content, q)
      );
      if (search) conds.push(search);
    }

    const rows = await db
      .select()
      .from(entries)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(entries.created));

    return rows.map(toEntry);
  }

  async get(id: string): Promise<Entry | null> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);
    return rows[0] ? toEntry(rows[0]) : null;
  }

  async create(data: Omit<Entry, "id" | "created" | "updated">): Promise<Entry> {
    const db = getDb(this.ws);
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split("T")[0];
    const entry: Entry = {
      ...data,
      id,
      tags: data.tags ?? [],
      created: now,
      updated: now,
    };
    await db.insert(entries).values({
      id: entry.id,
      type: entry.type,
      purpose: entry.purpose ?? null,
      register: entry.register ?? null,
      japanese: entry.japanese,
      reading: entry.reading ?? null,
      meaning: entry.meaning,
      tags: entry.tags,
      content: entry.content,
      created: entry.created,
      updated: entry.updated,
    });
    return entry;
  }

  async update(id: string, data: Partial<Entry>): Promise<Entry | null> {
    const db = getDb(this.ws);
    const existing = await this.get(id);
    if (!existing) return null;
    const now = new Date().toISOString().split("T")[0];
    const updated: Entry = { ...existing, ...data, id, updated: now };
    await db
      .update(entries)
      .set({
        type: updated.type,
        purpose: updated.purpose ?? null,
        register: updated.register ?? null,
        japanese: updated.japanese,
        reading: updated.reading ?? null,
        meaning: updated.meaning,
        tags: updated.tags,
        content: updated.content,
        updated: updated.updated,
      })
      .where(eq(entries.id, id));
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb(this.ws);
    const res = await db
      .delete(entries)
      .where(eq(entries.id, id))
      .returning({ id: entries.id });
    return res.length > 0;
  }

  async getAllTags(): Promise<string[]> {
    const db = getDb(this.ws);
    const res = await db.execute(
      sql`SELECT DISTINCT unnest(tags) AS tag FROM entries ORDER BY tag`
    );
    return (res.rows as { tag: string }[]).map((r) => r.tag);
  }
}
