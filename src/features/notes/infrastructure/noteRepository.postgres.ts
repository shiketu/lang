import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import type { Note } from "../domain/Note";
import type { NoteRepository } from "../domain/NoteRepository";

type Row = typeof notes.$inferSelect;

function toNote(row: Row): Note {
  return {
    date: row.date,
    content: row.content,
    tags: row.tags ?? [],
    created: row.created,
    updated: row.updated,
  };
}

export class PostgresNoteRepository implements NoteRepository {
  async list(): Promise<Note[]> {
    const db = getDb();
    const rows = await db.select().from(notes).orderBy(desc(notes.date));
    return rows.map(toNote);
  }

  async get(date: string): Promise<Note | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(notes)
      .where(eq(notes.date, date))
      .limit(1);
    return rows[0] ? toNote(rows[0]) : null;
  }

  async save(
    date: string,
    data: { content: string; tags?: string[] }
  ): Promise<Note> {
    const db = getDb();
    const now = new Date().toISOString();
    const tags = data.tags ?? [];
    const rows = await db
      .insert(notes)
      .values({
        date,
        content: data.content,
        tags,
        created: now,
        updated: now,
      })
      .onConflictDoUpdate({
        target: notes.date,
        set: { content: data.content, tags, updated: now },
      })
      .returning();
    return toNote(rows[0]);
  }

  async delete(date: string): Promise<boolean> {
    const db = getDb();
    const res = await db
      .delete(notes)
      .where(eq(notes.date, date))
      .returning({ date: notes.date });
    return res.length > 0;
  }
}
