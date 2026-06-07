import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { recordings } from "@/lib/db/schema";
import type { BlobStorageProvider } from "@/lib/storage/interfaces";
import type { Recording } from "../domain/Recording";
import type { RecordingRepository } from "../domain/RecordingRepository";
import { recordingFolder } from "./categoryFolder";

type Row = typeof recordings.$inferSelect;

function toRecording(row: Row): Recording {
  return {
    id: row.id,
    filename: row.filename,
    topic: row.topic ?? undefined,
    category: row.category ?? undefined,
    referenceUrl: row.referenceUrl ?? undefined,
    shadowingTargetId: row.shadowingTargetId ?? undefined,
    tags: row.tags ?? [],
    created: row.created,
    duration: row.duration ?? undefined,
  };
}

export class PostgresRecordingRepository implements RecordingRepository {
  constructor(
    private blobStorage: BlobStorageProvider,
    private ws: Workspace = "ja"
  ) {}

  async list(): Promise<Recording[]> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(recordings)
      .orderBy(desc(recordings.created));
    return rows.map(toRecording);
  }

  async get(id: string): Promise<Recording | null> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, id))
      .limit(1);
    return rows[0] ? toRecording(rows[0]) : null;
  }

  async save(
    file: File,
    meta: {
      topic?: string;
      category?: string;
      tags?: string[];
      shadowingTargetId?: string;
    }
  ): Promise<Recording> {
    const db = getDb(this.ws);
    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop() ?? "webm";
    const key = `${recordingFolder(meta)}/${id}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await this.blobStorage.put(key, buffer, file.type || "video/webm");

    const recording: Recording = {
      id,
      filename: key,
      topic: meta.topic,
      category: meta.category,
      shadowingTargetId: meta.shadowingTargetId,
      tags: meta.tags ?? [],
      created: new Date().toISOString(),
    };

    await db.insert(recordings).values({
      id: recording.id,
      filename: recording.filename,
      topic: recording.topic ?? null,
      category: recording.category ?? null,
      shadowingTargetId: recording.shadowingTargetId ?? null,
      tags: recording.tags,
      created: recording.created,
      duration: recording.duration ?? null,
    });

    return recording;
  }

  async getBlob(
    id: string
  ): Promise<{ data: Buffer; contentType: string } | null> {
    const meta = await this.get(id);
    if (!meta) return null;
    return this.blobStorage.get(meta.filename);
  }

  async getSignedUrl(id: string): Promise<string | null> {
    const meta = await this.get(id);
    if (!meta) return null;
    return this.blobStorage.createSignedUrl(meta.filename, 3600);
  }

  async delete(id: string): Promise<boolean> {
    const meta = await this.get(id);
    if (!meta) return false;
    await this.blobStorage.delete(meta.filename);
    const db = getDb(this.ws);
    await db.delete(recordings).where(eq(recordings.id, id));
    return true;
  }
}
