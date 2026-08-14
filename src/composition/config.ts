import path from "path";
import type { Workspace } from "@/lib/workspace";

// --- Path resolution ---

const PROJECT_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd());

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
  review: ReviewStorageConfig;
  activity: ActivityStorageConfig;
  shadowing: ShadowingStorageConfig;
  blob: BlobStorageConfig;
  recordingMeta: MetadataStoreConfig;
  llm: LLMConfig;
}

export function resolveConfig(ws: Workspace): AppConfig {
  // Each workspace has its own database + storage namespace.
  const suffix = ws === "en" ? "-en" : "";
  const contentDir = path.join(PROJECT_ROOT, `content${suffix}`);
  const recordingsDir = path.join(PROJECT_ROOT, `recordings${suffix}`);

  // When the workspace's DATABASE_URL is set, structured data goes to Postgres.
  // Otherwise fall back to local file-based storage (offline dev).
  const dbUrl = ws === "en" ? process.env.DATABASE_URL_EN : process.env.DATABASE_URL;
  const usePostgres = !!dbUrl;
  // Use S3 when explicitly requested or when a bucket is configured.
  const useS3 = process.env.BLOB_PROVIDER === "s3" || !!process.env.S3_BUCKET;
  const llmProvider = process.env.LLM_PROVIDER ?? "anthropic";

  const entries: EntryStorageConfig = usePostgres
    ? { provider: "postgres" }
    : {
        provider: "markdown",
        typeDirs: {
          vocabulary: path.join(contentDir, "vocabulary"),
          expression: path.join(contentDir, "expressions"),
          sentence: path.join(contentDir, "sentences"),
        },
        fallbackDir: contentDir,
      };

  const review: ReviewStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(contentDir, "reviews.json") };

  const activity: ActivityStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(contentDir, "activity.json") };

  const shadowing: ShadowingStorageConfig = usePostgres
    ? { provider: "postgres" }
    : { provider: "json-file", filePath: path.join(contentDir, "shadowing.json") };

  // Video files live in blob storage: S3 in production, local disk for offline dev.
  // Each workspace gets its own key prefix / directory.
  const s3Base = process.env.S3_PREFIX ?? "videos";
  const blob: BlobStorageConfig = useS3
    ? {
        provider: "s3",
        bucket: process.env.S3_BUCKET!,
        region: process.env.AWS_REGION ?? "ap-northeast-1",
        // ja keeps the original prefix (zero-regression); only en is namespaced.
        prefix: ws === "en" ? `${s3Base}/en` : s3Base,
      }
    : {
        provider: "local",
        baseDir: recordingsDir,
        urlPrefix: "/api/recordings/file",
      };

  const recordingMeta: MetadataStoreConfig = usePostgres
    ? { provider: "postgres" }
    : {
        provider: "json-file",
        filePath: path.join(recordingsDir, "_recordings.json"),
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

  return { entries, review, activity, shadowing, blob, recordingMeta, llm };
}
