/**
 * 一次性数据迁移：把现有文件存储的数据导入 Postgres。
 *
 * 用法（项目根目录）：
 *   DATABASE_URL=postgres://... npx tsx scripts/migrate-to-db.ts
 *
 * 前置：已用 `drizzle-kit push` 建好表。
 * 读取：现有 content/ 下 markdown、content/todos.json、recordings/_recordings.json
 * 写入：Postgres（经各 Postgres Repository）
 */
import path from "path";

// 文件实现（数据源）
import { MarkdownEntryRepository } from "../src/features/entries/infrastructure/entryRepository.markdown";
import { MarkdownNoteRepository } from "../src/features/notes/infrastructure/noteRepository.markdown";
import { JsonTaskRepository } from "../src/features/todos/infrastructure/taskRepository.json";
import { JsonMetadataStore } from "../src/lib/storage/jsonMetadataStore";

// Postgres 实现（目标）
import { getDb } from "../src/lib/db";
import { entries, notes, tasks, recordings } from "../src/lib/db/schema";
import type { Recording } from "../src/features/recordings/domain/Recording";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const RECORDINGS = path.join(ROOT, "recordings");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("请设置 DATABASE_URL 环境变量");
  }
  const db = getDb();

  // --- Entries ---
  const entryRepo = new MarkdownEntryRepository({
    typeDirs: {
      vocabulary: path.join(CONTENT, "vocabulary"),
      expression: path.join(CONTENT, "expressions"),
      sentence: path.join(CONTENT, "sentences"),
    },
    fallbackDir: CONTENT,
  });
  const allEntries = await entryRepo.list();
  for (const e of allEntries) {
    await db
      .insert(entries)
      .values({
        id: e.id,
        type: e.type,
        japanese: e.japanese,
        reading: e.reading ?? null,
        meaning: e.meaning,
        tags: e.tags,
        source: e.source ?? null,
        level: e.level ?? null,
        content: e.content,
        created: e.created,
        updated: e.updated,
      })
      .onConflictDoNothing();
  }
  console.log(`Entries: ${allEntries.length} 件`);

  // --- Notes ---
  const noteRepo = new MarkdownNoteRepository(path.join(CONTENT, "notes"));
  const allNotes = await noteRepo.list();
  for (const n of allNotes) {
    await db
      .insert(notes)
      .values({
        date: n.date,
        content: n.content,
        tags: n.tags,
        created: n.created,
        updated: n.updated,
      })
      .onConflictDoNothing();
  }
  console.log(`Notes: ${allNotes.length} 件`);

  // --- Tasks + completions ---
  const taskRepo = new JsonTaskRepository(path.join(CONTENT, "todos.json"));
  const allTasks = await taskRepo.listTasks();
  for (const t of allTasks) {
    await db
      .insert(tasks)
      .values({
        id: t.id,
        title: t.title,
        schedule: t.schedule,
        created: t.created,
      })
      .onConflictDoNothing();
  }
  console.log(`Tasks: ${allTasks.length} 件`);

  // --- Recordings metadata ---
  const recMeta = new JsonMetadataStore<Recording>(
    path.join(RECORDINGS, "_recordings.json")
  );
  const allRecordings = await recMeta.list();
  for (const r of allRecordings) {
    await db
      .insert(recordings)
      .values({
        id: r.id,
        filename: r.filename,
        topic: r.topic ?? null,
        tags: r.tags,
        created: r.created,
        duration: r.duration ?? null,
      })
      .onConflictDoNothing();
  }
  console.log(`Recordings: ${allRecordings.length} 件`);

  console.log("迁移完成。");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
