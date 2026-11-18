const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = Math.max(1, Number(process.env.WIDGET_RATE_LIMIT_PER_10MIN) || 30);
const MAX_CONCURRENT = 4;

const hits = new Map<string, number[]>();
let active = 0;

export type Admission =
  | { ok: true; release: () => void }
  | { ok: false; reason: "rate_limited" | "busy"; retryAfterSec: number };

export function admit(key: string, now = Date.now()): Admission {
  for (const [id, times] of hits) if (!times.length || now - times[times.length - 1] >= WINDOW_MS) hits.delete(id);
  if (!hits.has(key) && hits.size >= 2048) return { ok: false, reason: "busy", retryAfterSec: 60 };
  const list = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_REQUESTS) {
    hits.set(key, list);
    return { ok: false, reason: "rate_limited", retryAfterSec: Math.ceil((WINDOW_MS - (now - list[0])) / 1000) };
  }
  if (active >= MAX_CONCURRENT) return { ok: false, reason: "busy", retryAfterSec: 5 };
  list.push(now);
  hits.set(key, list);
  active += 1;
  let released = false;
  return {
    ok: true,
    release: () => {
      if (!released) {
        released = true;
        active -= 1;
      }
    },
  };
}

export function resetRateLimits() {
  hits.clear();
  active = 0;
}

export function clientKey(headers: { get(name: string): string | null }): string {
  if (process.env.TRUST_PROXY !== "1") return "local";
  return (headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "local").slice(0, 64);
}

export function isSameOrigin(headers: { get(name: string): string | null }): boolean {
  const origin = headers.get("origin");
  const host = headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
