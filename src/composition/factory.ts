import { MarkdownEntryRepository } from "@/features/entries/infrastructure/entryRepository.markdown";
import { MarkdownNoteRepository } from "@/features/notes/infrastructure/noteRepository.markdown";
import { JsonTaskRepository } from "@/features/todos/infrastructure/taskRepository.json";
import { LocalBlobStorage } from "@/lib/storage/localBlobStorage";
import { JsonMetadataStore } from "@/lib/storage/jsonMetadataStore";
import { LocalRecordingRepository } from "@/features/recordings/infrastructure/recordingRepository.local";
import { AnthropicProvider } from "@/lib/llm/anthropic";
import type { EntryRepository } from "@/features/entries/domain/EntryRepository";
import type { NoteRepository } from "@/features/notes/domain/NoteRepository";
import type { TaskRepository } from "@/features/todos/domain/TaskRepository";
import type { RecordingRepository } from "@/features/recordings/domain/RecordingRepository";
import type { LLMProvider } from "@/lib/llm/interfaces";
import type { Recording } from "@/features/recordings/domain/Recording";
import type {
  EntryStorageConfig,
  NoteStorageConfig,
  TaskStorageConfig,
  BlobStorageConfig,
  MetadataStoreConfig,
  LLMConfig,
  AppConfig,
} from "./config";

export function createEntryRepository(config: EntryStorageConfig): EntryRepository {
  switch (config.provider) {
    case "markdown":
      return new MarkdownEntryRepository({
        typeDirs: config.typeDirs,
        fallbackDir: config.fallbackDir,
      });
  }
}

export function createNoteRepository(config: NoteStorageConfig): NoteRepository {
  switch (config.provider) {
    case "markdown":
      return new MarkdownNoteRepository(config.dir);
  }
}

export function createTaskRepository(config: TaskStorageConfig): TaskRepository {
  switch (config.provider) {
    case "json-file":
      return new JsonTaskRepository(config.filePath);
  }
}

export function createRecordingRepository(config: AppConfig): RecordingRepository {
  const blobStorage = createBlobStorage(config.blob);
  const metadataStore = createMetadataStore<Recording>(config.recordingMeta);
  return new LocalRecordingRepository(blobStorage, metadataStore);
}

export function createLLM(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider({ model: config.model, apiKey: config.apiKey });
    case "openai":
      throw new Error("OpenAI provider not yet implemented");
  }
}

function createBlobStorage(config: BlobStorageConfig) {
  switch (config.provider) {
    case "local":
      return new LocalBlobStorage(config.baseDir, config.urlPrefix);
    case "s3":
      throw new Error("S3 blob storage not yet implemented");
  }
}

function createMetadataStore<T extends { id: string }>(config: MetadataStoreConfig) {
  switch (config.provider) {
    case "json-file":
      return new JsonMetadataStore<T>(config.filePath);
    case "s3-json":
      throw new Error("S3 metadata store not yet implemented");
  }
}
