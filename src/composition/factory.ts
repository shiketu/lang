import { MarkdownEntryRepository } from "@/features/entries/infrastructure/entryRepository.markdown";
import { PostgresEntryRepository } from "@/features/entries/infrastructure/entryRepository.postgres";
import { MarkdownNoteRepository } from "@/features/notes/infrastructure/noteRepository.markdown";
import { PostgresNoteRepository } from "@/features/notes/infrastructure/noteRepository.postgres";
import { JsonTaskRepository } from "@/features/todos/infrastructure/taskRepository.json";
import { PostgresTaskRepository } from "@/features/todos/infrastructure/taskRepository.postgres";
import { JsonReviewRepository } from "@/features/review/infrastructure/reviewRepository.json";
import { PostgresReviewRepository } from "@/features/review/infrastructure/reviewRepository.postgres";
import { JsonActivityRepository } from "@/features/activity/infrastructure/activityRepository.json";
import { PostgresActivityRepository } from "@/features/activity/infrastructure/activityRepository.postgres";
import { JsonShadowingTargetRepository } from "@/features/shadowing/infrastructure/shadowingTargetRepository.json";
import { PostgresShadowingTargetRepository } from "@/features/shadowing/infrastructure/shadowingTargetRepository.postgres";
import { LocalBlobStorage } from "@/lib/storage/localBlobStorage";
import { S3BlobStorage } from "@/lib/storage/s3BlobStorage";
import { JsonMetadataStore } from "@/lib/storage/jsonMetadataStore";
import { LocalRecordingRepository } from "@/features/recordings/infrastructure/recordingRepository.local";
import { PostgresRecordingRepository } from "@/features/recordings/infrastructure/recordingRepository.postgres";
import { AnthropicProvider } from "@/lib/llm/anthropic";
import type { EntryRepository } from "@/features/entries/domain/EntryRepository";
import type { NoteRepository } from "@/features/notes/domain/NoteRepository";
import type { TaskRepository } from "@/features/todos/domain/TaskRepository";
import type { ReviewRepository } from "@/features/review/domain/ReviewRepository";
import type { ActivityRepository } from "@/features/activity/domain/Activity";
import type { ShadowingTargetRepository } from "@/features/shadowing/domain/ShadowingTarget";
import type { RecordingRepository } from "@/features/recordings/domain/RecordingRepository";
import type { BlobStorageProvider } from "@/lib/storage/interfaces";
import type { LLMProvider } from "@/lib/llm/interfaces";
import type { Recording } from "@/features/recordings/domain/Recording";
import type {
  EntryStorageConfig,
  NoteStorageConfig,
  TaskStorageConfig,
  ReviewStorageConfig,
  ActivityStorageConfig,
  ShadowingStorageConfig,
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
    case "postgres":
      return new PostgresEntryRepository();
  }
}

export function createNoteRepository(config: NoteStorageConfig): NoteRepository {
  switch (config.provider) {
    case "markdown":
      return new MarkdownNoteRepository(config.dir);
    case "postgres":
      return new PostgresNoteRepository();
  }
}

export function createTaskRepository(config: TaskStorageConfig): TaskRepository {
  switch (config.provider) {
    case "json-file":
      return new JsonTaskRepository(config.filePath);
    case "postgres":
      return new PostgresTaskRepository();
  }
}

export function createReviewRepository(config: ReviewStorageConfig): ReviewRepository {
  switch (config.provider) {
    case "json-file":
      return new JsonReviewRepository(config.filePath);
    case "postgres":
      return new PostgresReviewRepository();
  }
}

export function createActivityRepository(
  config: ActivityStorageConfig
): ActivityRepository {
  switch (config.provider) {
    case "json-file":
      return new JsonActivityRepository(config.filePath);
    case "postgres":
      return new PostgresActivityRepository();
  }
}

export function createShadowingTargetRepository(
  config: ShadowingStorageConfig
): ShadowingTargetRepository {
  switch (config.provider) {
    case "json-file":
      return new JsonShadowingTargetRepository(config.filePath);
    case "postgres":
      return new PostgresShadowingTargetRepository();
  }
}

export function createRecordingRepository(config: AppConfig): RecordingRepository {
  const blobStorage = createBlobStorage(config.blob);
  if (config.recordingMeta.provider === "postgres") {
    return new PostgresRecordingRepository(blobStorage);
  }
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

function createBlobStorage(config: BlobStorageConfig): BlobStorageProvider {
  switch (config.provider) {
    case "local":
      return new LocalBlobStorage(config.baseDir, config.urlPrefix);
    case "s3":
      return new S3BlobStorage(config.bucket, config.region, config.prefix);
  }
}

function createMetadataStore<T extends { id: string }>(config: MetadataStoreConfig) {
  switch (config.provider) {
    case "json-file":
      return new JsonMetadataStore<T>(config.filePath);
    case "s3-json":
      throw new Error("S3 metadata store not yet implemented");
    case "postgres":
      throw new Error("Postgres metadata store handled by PostgresRecordingRepository");
  }
}
