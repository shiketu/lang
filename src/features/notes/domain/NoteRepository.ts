import type { Note } from "./Note";

export interface NoteRepository {
  list(): Promise<Note[]>;
  get(date: string): Promise<Note | null>;
  save(date: string, data: { content: string; tags?: string[] }): Promise<Note>;
  delete(date: string): Promise<boolean>;
}
