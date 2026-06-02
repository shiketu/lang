import { entryRepository } from "@/composition";
import type { Entry, EntryFilter } from "../domain/Entry";

export function listEntries(filter?: EntryFilter): Promise<Entry[]> {
  return entryRepository.list(filter);
}

export function getEntry(id: string): Promise<Entry | null> {
  return entryRepository.get(id);
}

export function createEntry(
  data: Omit<Entry, "id" | "created" | "updated">
): Promise<Entry> {
  return entryRepository.create(data);
}

export function updateEntry(
  id: string,
  data: Partial<Entry>
): Promise<Entry | null> {
  return entryRepository.update(id, data);
}

export function deleteEntry(id: string): Promise<boolean> {
  return entryRepository.delete(id);
}

export function getAllTags(): Promise<string[]> {
  return entryRepository.getAllTags();
}
