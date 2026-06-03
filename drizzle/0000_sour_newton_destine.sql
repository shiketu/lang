CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"japanese" text NOT NULL,
	"reading" text,
	"meaning" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"source" text,
	"level" text,
	"content" text DEFAULT '' NOT NULL,
	"created" text NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"date" text PRIMARY KEY NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created" text NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"topic" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created" text NOT NULL,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"date" text NOT NULL,
	"task_id" text NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "task_completions_date_task_id_pk" PRIMARY KEY("date","task_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"schedule" jsonb NOT NULL,
	"created" text NOT NULL
);
