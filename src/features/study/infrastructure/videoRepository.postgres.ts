import crypto from "crypto";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { videos } from "@/lib/db/schema";
import type { Video, VideoRepository } from "../domain/Video";

type Row = typeof videos.$inferSelect;

function toVideo(r: Row): Video {
  return {
    id: r.id,
    videoId: r.videoId,
    title: r.title,
    referenceUrl: r.referenceUrl,
    category: r.category ?? undefined,
    transcript: r.transcript ?? undefined,
    created: r.created,
  };
}

export class PostgresVideoRepository implements VideoRepository {
  constructor(private ws: Workspace = "ja") {}

  async list(): Promise<Video[]> {
    const db = getDb(this.ws);
    const rows = await db.select().from(videos).orderBy(desc(videos.created));
    return rows.map(toVideo);
  }

  async get(id: string): Promise<Video | null> {
    const db = getDb(this.ws);
    const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    return rows[0] ? toVideo(rows[0]) : null;
  }

  async create(data: Omit<Video, "id" | "created">): Promise<Video> {
    const db = getDb(this.ws);
    const video: Video = {
      ...data,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    await db.insert(videos).values({
      id: video.id,
      videoId: video.videoId,
      title: video.title,
      referenceUrl: video.referenceUrl,
      category: video.category ?? null,
      transcript: video.transcript ?? null,
      created: video.created,
    });
    return video;
  }

  async update(id: string, data: Partial<Video>): Promise<Video | null> {
    const db = getDb(this.ws);
    const patch: Partial<typeof videos.$inferInsert> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.category !== undefined) patch.category = data.category ?? null;
    if (data.transcript !== undefined) patch.transcript = data.transcript ?? null;
    if (Object.keys(patch).length === 0) return this.get(id);

    const rows = await db
      .update(videos)
      .set(patch)
      .where(eq(videos.id, id))
      .returning();
    return rows[0] ? toVideo(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb(this.ws);
    const res = await db
      .delete(videos)
      .where(eq(videos.id, id))
      .returning({ id: videos.id });
    return res.length > 0;
  }

  async count(): Promise<number> {
    const db = getDb(this.ws);
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(videos);
    return rows[0]?.n ?? 0;
  }
}
