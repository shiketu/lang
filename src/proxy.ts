import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that must stay reachable without a session (Clerk's own handshake/portal).
const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/__clerk/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, run on everything else
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
