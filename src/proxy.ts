import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that must stay reachable without a session / locale (Clerk handshake).
const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/__clerk/(.*)"]);

const LOCALES = ["ja", "en"];

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
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

  // Localize page paths (skip API — clients build /[ws]/api — Clerk, and public routes).
  if (!pathname.startsWith("/api") && !isPublic(req) && !hasLocalePrefix(pathname)) {
    const loc = detectLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${loc}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

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
