import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Routes that must stay reachable without a session / locale (Clerk handshake).
const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/__clerk/(.*)"]);

const LOCALES = ["ja", "en"];

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

/**
 * After refreshing an expired session, Clerk bounces back to the app with
 * `__clerk_*` query params (handshake token, status, dev-browser JWT).
 *
 * Those requests must reach Clerk's own handling untouched. Returning our own
 * redirect first drops the refreshed `Set-Cookie` headers Clerk attaches to the
 * response, so the browser follows the redirect still holding the stale cookie,
 * gets sent back into a handshake, and loops forever — the only escape being to
 * clear cookies by hand.
 */
function isClerkCallback(req: NextRequest): boolean {
  for (const key of req.nextUrl.searchParams.keys()) {
    if (key.startsWith("__clerk")) return true;
  }
  return false;
}

// Pick a locale from Accept-Language; default "ja". (No cookie — URL is the source of truth.)
function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "ja";
  const al = acceptLanguage.toLowerCase();
  const en = al.indexOf("en");
  const ja = al.indexOf("ja");
  if (en === -1) return "ja";
  if (ja === -1) return "en";
  return en < ja ? "en" : "ja";
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Localize page paths (skip API — clients build /api/[ws] — Clerk callbacks,
  // and public routes).
  if (
    !isClerkCallback(req) &&
    !pathname.startsWith("/api") &&
    !isPublic(req) &&
    !hasLocalePrefix(pathname)
  ) {
    const loc = detectLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${loc}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!isPublic(req)) {
    if (pathname.startsWith("/api")) {
      // API: let Clerk answer with an error, never an HTML sign-in redirect —
      // apiFetch() callers expect JSON / a status code.
      await auth.protect();
    } else {
      // Pages: send unauthenticated visitors to our own sign-in page. Built from
      // nextUrl, the same origin resolution the locale redirect above already
      // relies on behind the tunnel.
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/sign-in";
      signInUrl.search = "";
      await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
    }
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
