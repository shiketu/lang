import path from "path";
import fs from "fs/promises";
import {
  readAllMarkdownFiles,
  writeMarkdownFile,
  parseMarkdownFile,
} from "@/lib/storage/markdown";
import type { Note } from "../domain/Note";
import type { NoteRepository } from "../domain/NoteRepository";

function toNote(slug: string, frontmatter: Record<string, unknown>, content: string): Note {
  return {
    date: slug,
    content: content,
    tags: Array.isArray(frontmatter.tags)
      ? (frontmatter.tags as string[])
      : [],
    created: String(frontmatter.created ?? ""),
    updated: String(frontmatter.updated ?? ""),
  };
}

export class MarkdownNoteRepository implements NoteRepository {
  constructor(private dir: string) {}

  async list(): Promise<Note[]> {
    const docs = await readAllMarkdownFiles(this.dir);
    const notes = docs.map((doc) =>
      toNote(doc.slug, doc.frontmatter, doc.content)
    );
    return notes.sort((a, b) => b.date.localeCompare(a.date));
  }

  async get(date: string): Promise<Note | null> {
    const filePath = path.join(this.dir, `${date}.md`);
    try {
      const doc = await parseMarkdownFile(filePath);
      return toNote(doc.slug, doc.frontmatter, doc.content);
    } catch {
      return null;
    }
  }

  async save(
    date: string,
    data: { content: string; tags?: string[] }
  ): Promise<Note> {
    const filePath = path.join(this.dir, `${date}.md`);
    const now = new Date().toISOString();

    // Preserve created timestamp if the note already exists
    const existing = await this.get(date);
    const created = existing?.created || now;

    const frontmatter: Record<string, unknown> = {
      created,
      updated: now,
    };
    if (data.tags && data.tags.length > 0) {
      frontmatter.tags = data.tags;
    }

    await writeMarkdownFile(filePath, frontmatter, data.content);

    return {
      date,
      content: data.content,
      tags: data.tags ?? [],
      created,
      updated: now,
    };
  }

  async delete(date: string): Promise<boolean> {
    const filePath = path.join(this.dir, `${date}.md`);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
