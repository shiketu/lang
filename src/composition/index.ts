import { resolveConfig } from "./config";
import {
  createEntryRepository,
  createReviewRepository,
  createActivityRepository,
  createVideoRepository,
  createClipRepository,
  createRecordingRepository,
  createLLM,
} from "./factory";
import { getWorkspace, WORKSPACES, type Workspace } from "@/lib/workspace";

function buildRepos(ws: Workspace) {
  const config = resolveConfig(ws);
  return {
    entry: createEntryRepository(config.entries, ws),
    review: createReviewRepository(config.review, ws),
    activity: createActivityRepository(config.activity, ws),
    video: createVideoRepository(config.videos, ws),
    clip: createClipRepository(config.clips, ws),
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
export const getReviewRepository = () => byWs[getWorkspace()].review;
export const getActivityRepository = () => byWs[getWorkspace()].activity;
export const getVideoRepository = () => byWs[getWorkspace()].video;
export const getClipRepository = () => byWs[getWorkspace()].clip;
export const getRecordingRepository = () => byWs[getWorkspace()].recording;
