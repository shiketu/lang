import {
  pgTable,
  text,
  integer,
  real,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type {
  EntryType,
  Purpose,
  Register,
} from "@/features/entries/domain/Entry";
import type { TranscriptLine } from "@/features/study/domain/Video";
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

export const recordings = pgTable("recordings", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  topic: text("topic"),
  category: text("category"),
  referenceUrl: text("reference_url"),
  // Every recording belongs to a video; clipId is set only for clip-scoped
  // practice, and seg_* only for per-sentence repeat attempts.
  videoRef: text("video_ref"),
  clipId: text("clip_id"),
  // Sentence sub-segment within the clip for repeat practice (null = whole-clip attempt).
  segStart: real("seg_start"),
  segEnd: real("seg_end"),
  tags: text("tags").array().notNull().default([]),
  created: text("created").notNull(),
  duration: integer("duration"),
});

// A study video: the unit you navigate into. Clips, captions and recordings
// all hang off one of these.
export const videos = pgTable("videos", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(), // YouTube id
  title: text("title").notNull(),
  referenceUrl: text("reference_url").notNull(),
  category: text("category"),
  // Pasted + parsed captions: [{ t: seconds, text }]; null until provided.
  transcript: jsonb("transcript").$type<TranscriptLine[]>(),
  created: text("created").notNull(),
});

// A practice segment inside one video.
export const clips = pgTable("clips", {
  id: text("id").primaryKey(),
  videoRef: text("video_ref").notNull(),
  title: text("title").notNull(),
  segmentStart: real("segment_start").notNull(),
  segmentEnd: real("segment_end").notNull(),
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
