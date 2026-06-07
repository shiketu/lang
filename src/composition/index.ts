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
import { getWorkspace, WORKSPACES, type Workspace } from "@/lib/workspace";

function buildRepos(ws: Workspace) {
  const config = resolveConfig(ws);
  return {
    entry: createEntryRepository(config.entries, ws),
    note: createNoteRepository(config.notes, ws),
    task: createTaskRepository(config.tasks, ws),
    review: createReviewRepository(config.review, ws),
    activity: createActivityRepository(config.activity, ws),
    shadowing: createShadowingTargetRepository(config.shadowing, ws),
    recording: createRecordingRepository(config, ws),
  };
}

// One repository set per workspace; LLM is workspace-independent.
const byWs: Record<Workspace, ReturnType<typeof buildRepos>> = Object.fromEntries(
  WORKSPACES.map((ws) => [ws, buildRepos(ws)])
) as Record<Workspace, ReturnType<typeof buildRepos>>;

export const llm = createLLM(resolveConfig("ja").llm);

// Workspace-aware accessors. `getWorkspace()` reads the request-scoped ALS
// value (seeded from the URL); defaults to "ja" outside a request.
export const getEntryRepository = () => byWs[getWorkspace()].entry;
export const getNoteRepository = () => byWs[getWorkspace()].note;
export const getTaskRepository = () => byWs[getWorkspace()].task;
export const getReviewRepository = () => byWs[getWorkspace()].review;
export const getActivityRepository = () => byWs[getWorkspace()].activity;
export const getShadowingTargetRepository = () => byWs[getWorkspace()].shadowing;
export const getRecordingRepository = () => byWs[getWorkspace()].recording;
