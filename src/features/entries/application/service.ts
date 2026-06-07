import { getEntryRepository } from "@/composition";
import type { Entry, EntryFilter } from "../domain/Entry";

export function listEntries(filter?: EntryFilter): Promise<Entry[]> {
  return getEntryRepository().list(filter);
}

export function getEntry(id: string): Promise<Entry | null> {
  return getEntryRepository().get(id);
}

export function createEntry(
  data: Omit<Entry, "id" | "created" | "updated">
): Promise<Entry> {
  return getEntryRepository().create(data);
}

export function updateEntry(
  id: string,
  data: Partial<Entry>
): Promise<Entry | null> {
  return getEntryRepository().update(id, data);
}

export function deleteEntry(id: string): Promise<boolean> {
  return getEntryRepository().delete(id);
}

export function getAllTags(): Promise<string[]> {
  return getEntryRepository().getAllTags();
}
