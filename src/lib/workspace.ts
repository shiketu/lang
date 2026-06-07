import { AsyncLocalStorage } from "async_hooks";

// A workspace is an isolated language edition with its own database / storage.
export type Workspace = "ja" | "en";

export const WORKSPACES: Workspace[] = ["ja", "en"];
export const DEFAULT_WORKSPACE: Workspace = "ja";

export function hasLocale(x: string | undefined): x is Workspace {
  return x === "ja" || x === "en";
}

export function normalizeWorkspace(x: string | undefined): Workspace {
  return x === "en" ? "en" : "ja";
}

// Request-scoped current workspace. Seeded from the URL (`/api/[ws]`, `/[ws]`)
// at the route boundary via runWithWorkspace — never from a cookie.
const als = new AsyncLocalStorage<Workspace>();

export function runWithWorkspace<T>(ws: string | undefined, fn: () => T): T {
  return als.run(normalizeWorkspace(ws), fn);
}

/** Current workspace for this request; defaults to "ja" outside an ALS scope. */
export function getWorkspace(): Workspace {
  return als.getStore() ?? DEFAULT_WORKSPACE;
}

/**
 * Wraps a Next route handler so the data layer runs under the workspace taken
 * from the route's `[ws]` segment (`/api/[ws]/...`). No cookie involved.
 */
export function withWorkspaceRoute<Args extends unknown[], R>(
  handler: (...args: Args) => R | Promise<R>
) {
  return async (...args: Args): Promise<R> => {
    const ctx = args[1] as { params?: Promise<{ ws?: string }> } | undefined;
    const ws = ctx?.params ? (await ctx.params).ws : undefined;
    return runWithWorkspace(ws, () => handler(...args));
  };
}
