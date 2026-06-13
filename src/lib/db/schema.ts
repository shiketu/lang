import {
  pgTable,
  text,
  integer,
  real,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { TaskSchedule, TaskStatus } from "@/features/todos/domain/Task";
import type {
  EntryType,
  Purpose,
  Register,
} from "@/features/entries/domain/Entry";
import type { ReviewKind } from "@/features/review/domain/Reviewable";
import type { ActivityKind } from "@/features/activity/domain/Activity";

export const entries = pgTable("entries", {
  id: text("id").primaryKey(),
  type: text("type").$type<EntryType>().notNull(),
  purpose: text("purpose").$type<Purpose>(),
  register: text("register").$type<Register>(),
  japanese: text("japanese").notNull(),
  reading: text("reading"),
  meaning: text("meaning").notNull(),
  tags: text("tags").array().notNull().default([]),
  content: text("content").notNull().default(""),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const notes = pgTable("notes", {
  date: text("date").primaryKey(),
  content: text("content").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  schedule: jsonb("schedule").$type<TaskSchedule>().notNull(),
  created: text("created").notNull(),
});

export const taskCompletions = pgTable(
  "task_completions",
  {
    date: text("date").notNull(),
    taskId: text("task_id").notNull(),
    status: text("status").$type<TaskStatus>().notNull(),
  },
  (t) => [primaryKey({ columns: [t.date, t.taskId] })]
);

export const recordings = pgTable("recordings", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  topic: text("topic"),
  category: text("category"),
  referenceUrl: text("reference_url"),
  shadowingTargetId: text("shadowing_target_id"),
  // Sentence sub-segment within the clip for repeat practice (null = whole-clip attempt).
  segStart: real("seg_start"),
  segEnd: real("seg_end"),
  tags: text("tags").array().notNull().default([]),
  created: text("created").notNull(),
  duration: integer("duration"),
});

export const shadowingTargets = pgTable("shadowing_targets", {
  id: text("id").primaryKey(),
  referenceUrl: text("reference_url").notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  segmentStart: real("segment_start").notNull(),
  segmentEnd: real("segment_end").notNull(),
  category: text("category"),
  created: text("created").notNull(),
});

export const reviewSchedule = pgTable(
  "review_schedule",
  {
    kind: text("kind").$type<ReviewKind>().notNull(),
    refId: text("ref_id").notNull(),
    ease: real("ease").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    due: text("due").notNull(),
    lastReviewed: text("last_reviewed"),
    created: text("created").notNull(),
  },
  (t) => [primaryKey({ columns: [t.kind, t.refId] })]
);

export const activityLog = pgTable(
  "activity_log",
  {
    date: text("date").notNull(),
    kind: text("kind").$type<ActivityKind>().notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.date, t.kind] })]
);
