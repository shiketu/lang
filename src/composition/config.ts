import path from "path";

// --- Path resolution ---

const PROJECT_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd());
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");
const RECORDINGS_DIR = path.join(PROJECT_ROOT, "recordings");

// --- Entry storage ---

export type EntryStorageConfig =
  | {
      provider: "markdown";
      typeDirs: Record<string, string>;
      fallbackDir: string;
    }
  | { provider: "postgres" };

// --- Blob storage ---

export type BlobStorageConfig =
  | { provider: "local"; baseDir: string; urlPrefix: string }
  | { provider: "s3"; bucket: string; region: string; prefix?: string };

// --- Metadata store (recordings) ---

export type MetadataStoreConfig =
  | { provider: "json-file"; filePath: string }
  | { provider: "s3-json"; bucket: string; key: string; region: string }
  | { provider: "postgres" };

// --- LLM ---

export type LLMConfig =
  | { provider: "anthropic"; model: string; apiKey?: string }
  | { provider: "openai"; model: string; apiKey?: string };

// --- Note storage ---

export type NoteStorageConfig =
  | { provider: "markdown"; dir: string }
  | { provider: "postgres" };

// --- Task storage ---

export type TaskStorageConfig =
  | { provider: "json-file"; filePath: string }
  | { provider: "postgres" };

// --- Review schedule storage ---

export type ReviewStorageConfig =
  | { provider: "json-file"; filePath: string }
  | { provider: "postgres" };

// --- Activity log storage ---

export type ActivityStorageConfig =
  | { provider: "json-file"; filePath: string }
  | { provider: "postgres" };

// --- Shadowing target storage ---

export type ShadowingStorageConfig =
  | { provider: "json-file"; filePath: string }
  | { provider: "postgres" };

// --- Full assembly ---

export interface AppConfig {
  entries: EntryStorageConfig;
  notes: NoteStorageConfig;
  tasks: TaskStorageConfig;
  review: ReviewStorageConfig;
  activity: ActivityStorageConfig;
  shadowing: ShadowingStorageConfig;
  blob: BlobStorageConfig;
  recordingMeta: MetadataStoreConfig;
  llm: LLMConfig;
}

export function resolveConfig(): AppConfig {
  // When DATABASE_URL is set, structured data goes to Postgres.
  // Otherwise fall back to local file-based storage (offline dev).
  const usePostgres = !!process.env.DATABASE_URL;
  // Use S3 when explicitly requested or when a bucket is configured.
  const useS3 = process.env.BLOB_PROVIDER === "s3" || !!process.env.S3_BUCKET;
  const llmProvider = process.env.LLM_PROVIDER ?? "anthropic";

  const entries: EntryStorageConfig = usePostgres
    ? { provider: "postgres" }
    : {
        provider: "markdown",
        typeDirs: {
          vocabulary: path.join(CONTENT_DIR, "vocabulary"),
          expression: path.join(CONTENT_DIR, "expressions"),
          sentence: path.join(CONTENT_DIR, "sentences"),
        },
        fallbackDir: CONTENT_DIR,
      };

  const notes: NoteStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "markdown", dir: path.join(CONTENT_DIR, "notes") };

  const tasks: TaskStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(CONTENT_DIR, "todos.json") };

  const review: ReviewStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(CONTENT_DIR, "reviews.json") };

  const activity: ActivityStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(CONTENT_DIR, "activity.json") };

  const shadowing: ShadowingStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(CONTENT_DIR, "shadowing.json") };

  // Video files live in blob storage: S3 in production, local disk for offline dev.
  const blob: BlobStorageConfig = useS3
    ? {
        provider: "s3",
        bucket: process.env.S3_BUCKET!,
        region: process.env.AWS_REGION ?? "ap-northeast-1",
        prefix: process.env.S3_PREFIX ?? "videos",
      }
    : {
        provider: "local",
        baseDir: RECORDINGS_DIR,
        urlPrefix: "/api/recordings/file",
      };

  const recordingMeta: MetadataStoreConfig = usePostgres
    ? { provider: "postgres" }
    : {
        provider: "json-file",
        filePath: path.join(RECORDINGS_DIR, "_recordings.json"),
      };

  const llm: LLMConfig =
    llmProvider === "openai"
      ? {
          provider: "openai",
          model: process.env.OPENAI_MODEL ?? "gpt-4o",
          apiKey: process.env.OPENAI_API_KEY,
        }
      : {
          provider: "anthropic",
          model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
          apiKey: process.env.ANTHROPIC_API_KEY,
        };

  return { entries, notes, tasks, review, activity, shadowing, blob, recordingMeta, llm };
}
