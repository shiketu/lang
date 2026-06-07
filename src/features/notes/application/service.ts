import { getNoteRepository } from "@/composition";
import type { Note } from "../domain/Note";

export function listNotes(): Promise<Note[]> {
  return getNoteRepository().list();
}

export function getNote(date: string): Promise<Note | null> {
  return getNoteRepository().get(date);
}

export function saveNote(
  date: string,
  data: { content: string; tags?: string[] }
): Promise<Note> {
  return getNoteRepository().save(date, data);
}

export function deleteNote(date: string): Promise<boolean> {
  return getNoteRepository().delete(date);
}
