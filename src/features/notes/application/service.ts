import { noteRepository } from "@/composition";
import type { Note } from "../domain/Note";

export function listNotes(): Promise<Note[]> {
  return noteRepository.list();
}

export function getNote(date: string): Promise<Note | null> {
  return noteRepository.get(date);
}

export function saveNote(
  date: string,
  data: { content: string; tags?: string[] }
): Promise<Note> {
  return noteRepository.save(date, data);
}

export function deleteNote(date: string): Promise<boolean> {
  return noteRepository.delete(date);
}
