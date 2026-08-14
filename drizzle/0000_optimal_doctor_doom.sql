CREATE TABLE "activity_log" (
	"date" text NOT NULL,
	"kind" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "activity_log_date_kind_pk" PRIMARY KEY("date","kind")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"purpose" text,
	"register" text,
	"japanese" text NOT NULL,
	"reading" text,
	"meaning" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created" text NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"topic" text,
	"category" text,
	"reference_url" text,
	"shadowing_target_id" text,
	"seg_start" real,
	"seg_end" real,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created" text NOT NULL,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE "review_schedule" (
	"kind" text NOT NULL,
	"ref_id" text NOT NULL,
	"ease" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"due" text NOT NULL,
	"last_reviewed" text,
	"created" text NOT NULL,
	CONSTRAINT "review_schedule_kind_ref_id_pk" PRIMARY KEY("kind","ref_id")
);
--> statement-breakpoint
CREATE TABLE "shadowing_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_url" text NOT NULL,
	"video_id" text NOT NULL,
	"title" text NOT NULL,
	"segment_start" real NOT NULL,
	"segment_end" real NOT NULL,
	"category" text,
	"created" text NOT NULL
);
