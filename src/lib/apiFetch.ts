// Client-side fetch helper that targets the current workspace's API namespace.
// The workspace is read from the URL (`/ja/...` or `/en/...`) — no cookie.
function currentWs(): string {
  if (typeof window === "undefined") return "ja";
  return window.location.pathname.split("/")[1] === "en" ? "en" : "ja";
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api/${currentWs()}${path}`, init);
}

/** Prefixes an in-app page path with a workspace segment (for <Link href> / router.push). */
export function wsHref(ws: string, path: string): string {
  return `/${ws}${path}`;
}
