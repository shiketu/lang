import type { BlobStorageProvider, MetadataStore } from "@/lib/storage/interfaces";
import type { Recording } from "../domain/Recording";
import type { RecordingRepository } from "../domain/RecordingRepository";
import { categoryFolder } from "./categoryFolder";

export class LocalRecordingRepository implements RecordingRepository {
  constructor(
    private blobStorage: BlobStorageProvider,
    private metadataStore: MetadataStore<Recording>
  ) {}

  async save(
    file: File,
    meta: { topic?: string; category?: string; tags?: string[] }
  ): Promise<Recording> {
    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop() ?? "webm";
    const key = `${categoryFolder(meta.category)}/${id}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await this.blobStorage.put(key, buffer, file.type || "video/webm");

    const recording: Recording = {
      id,
      filename: key,
      topic: meta.topic,
      category: meta.category,
      tags: meta.tags ?? [],
      created: new Date().toISOString(),
    };

    await this.metadataStore.put(recording);
    return recording;
  }

  async getBlob(
    id: string
  ): Promise<{ data: Buffer; contentType: string } | null> {
    const meta = await this.metadataStore.get(id);
    if (!meta) return null;
    return this.blobStorage.get(meta.filename);
  }

  async getSignedUrl(id: string): Promise<string | null> {
    const meta = await this.metadataStore.get(id);
    if (!meta) return null;
    return this.blobStorage.createSignedUrl(meta.filename, 3600);
  }

  async delete(id: string): Promise<boolean> {
    const meta = await this.metadataStore.get(id);
    if (!meta) return false;
    await this.blobStorage.delete(meta.filename);
    await this.metadataStore.remove(id);
    return true;
  }

  list(): Promise<Recording[]> {
    return this.metadataStore.list();
  }

  get(id: string): Promise<Recording | null> {
    return this.metadataStore.get(id);
  }
}
