import crypto from "crypto";
import { eq, asc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { clips } from "@/lib/db/schema";
import type { Clip, ClipRepository } from "../domain/Clip";

type Row = typeof clips.$inferSelect;

function toClip(r: Row): Clip {
  return {
    id: r.id,
    videoRef: r.videoRef,
    title: r.title,
    segmentStart: r.segmentStart,
    segmentEnd: r.segmentEnd,
    created: r.created,
  };
}

export class PostgresClipRepository implements ClipRepository {
  constructor(private ws: Workspace = "ja") {}

  async list(videoRef?: string): Promise<Clip[]> {
    const db = getDb(this.ws);
    const q = db.select().from(clips);
    const rows = videoRef
      ? await q.where(eq(clips.videoRef, videoRef)).orderBy(asc(clips.segmentStart))
      : await q.orderBy(asc(clips.segmentStart));
    return rows.map(toClip);
  }

  async get(id: string): Promise<Clip | null> {
    const db = getDb(this.ws);
    const rows = await db.select().from(clips).where(eq(clips.id, id)).limit(1);
    return rows[0] ? toClip(rows[0]) : null;
  }

  async create(data: Omit<Clip, "id" | "created">): Promise<Clip> {
    const db = getDb(this.ws);
    const clip: Clip = {
      ...data,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    await db.insert(clips).values({
      id: clip.id,
      videoRef: clip.videoRef,
      title: clip.title,
      segmentStart: clip.segmentStart,
      segmentEnd: clip.segmentEnd,
      created: clip.created,
    });
    return clip;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb(this.ws);
    const res = await db
      .delete(clips)
      .where(eq(clips.id, id))
      .returning({ id: clips.id });
    return res.length > 0;
  }

  async count(): Promise<number> {
    const db = getDb(this.ws);
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(clips);
    return rows[0]?.n ?? 0;
  }
}
