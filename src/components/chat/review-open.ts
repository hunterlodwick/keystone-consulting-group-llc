const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "0:0:0:0:0:0:0:1"]);

export function isLoopbackHostName(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return LOOPBACK.has(host);
}

/** Loopback-only: open the chat panel from ?chat=1 or legacy ?review=checklist. */
export function loopbackReviewShouldOpen(hostname: string, search: string): boolean {
  if (!isLoopbackHostName(hostname)) return false;
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  if (params.get("chat") === "1" || params.get("open") === "chat") return true;
  return params.get("review") === "checklist";
}
