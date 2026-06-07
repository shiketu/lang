import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Workspace } from "@/lib/workspace";
import { shadowingTargets } from "@/lib/db/schema";
import type {
  ShadowingTarget,
  ShadowingTargetRepository,
} from "../domain/ShadowingTarget";

type Row = typeof shadowingTargets.$inferSelect;

function toTarget(r: Row): ShadowingTarget {
  return {
    id: r.id,
    referenceUrl: r.referenceUrl,
    videoId: r.videoId,
    title: r.title,
    segmentStart: r.segmentStart,
    segmentEnd: r.segmentEnd,
    category: r.category ?? undefined,
    created: r.created,
  };
}

export class PostgresShadowingTargetRepository implements ShadowingTargetRepository {
  constructor(private ws: Workspace = "ja") {}

  async list(): Promise<ShadowingTarget[]> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(shadowingTargets)
      .orderBy(desc(shadowingTargets.created));
    return rows.map(toTarget);
  }

  async get(id: string): Promise<ShadowingTarget | null> {
    const db = getDb(this.ws);
    const rows = await db
      .select()
      .from(shadowingTargets)
      .where(eq(shadowingTargets.id, id))
      .limit(1);
    return rows[0] ? toTarget(rows[0]) : null;
  }

  async create(
    data: Omit<ShadowingTarget, "id" | "created">
  ): Promise<ShadowingTarget> {
    const db = getDb(this.ws);
    const target: ShadowingTarget = {
      ...data,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
    };
    await db.insert(shadowingTargets).values({
      id: target.id,
      referenceUrl: target.referenceUrl,
      videoId: target.videoId,
      title: target.title,
      segmentStart: target.segmentStart,
      segmentEnd: target.segmentEnd,
      category: target.category ?? null,
      created: target.created,
    });
    return target;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb(this.ws);
    const res = await db
      .delete(shadowingTargets)
      .where(eq(shadowingTargets.id, id))
      .returning({ id: shadowingTargets.id });
    return res.length > 0;
  }
}
