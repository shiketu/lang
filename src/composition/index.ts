import { resolveConfig } from "./config";
import {
  createEntryRepository,
  createNoteRepository,
  createTaskRepository,
  createReviewRepository,
  createActivityRepository,
  createShadowingTargetRepository,
  createRecordingRepository,
  createLLM,
} from "./factory";

const config = resolveConfig();

export const entryRepository = createEntryRepository(config.entries);
export const noteRepository = createNoteRepository(config.notes);
export const taskRepository = createTaskRepository(config.tasks);
export const reviewRepository = createReviewRepository(config.review);
export const activityRepository = createActivityRepository(config.activity);
export const shadowingTargetRepository = createShadowingTargetRepository(config.shadowing);
export const recordingRepository = createRecordingRepository(config);
export const llm = createLLM(config.llm);
