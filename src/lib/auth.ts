import { auth } from "@clerk/nextjs/server";

/**
 * Defense-in-depth guard for API route handlers.
 *
 * The proxy middleware (`src/proxy.ts`) already blocks unauthenticated
 * requests before they reach any handler. This is a second, in-handler check
 * that stays correct even if the middleware matcher is ever misconfigured.
 *
 * Returns a 401 `Response` when there is no signed-in user, otherwise `null`.
 *
 * Usage:
 *   const unauthorized = await requireAuth();
 *   if (unauthorized) return unauthorized;
 */
export async function requireAuth(): Promise<Response | null> {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
