import {
  pgTable,
  text,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { TaskSchedule, TaskStatus } from "@/features/todos/domain/Task";
import type {
  EntryType,
  Purpose,
  Register,
} from "@/features/entries/domain/Entry";

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
  tags: text("tags").array().notNull().default([]),
  created: text("created").notNull(),
  duration: integer("duration"),
});
