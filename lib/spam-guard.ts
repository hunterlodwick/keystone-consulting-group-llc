import { createHmac, timingSafeEqual } from "node:crypto";

export type Verdict = "ok" | "drop" | "spam";
export interface SpamGuardConfig {
  secret?: string;
  honeypotField?: string;
  tokenField?: string;
  minSubmitMs?: number;
  maxTokenAgeMs?: number;
  requireToken?: boolean;
  rateLimit?: { max: number; windowMs: number } | false;
  spamThreshold?: number;
  extraPhrases?: string[];
  disablePhrases?: string[];
  maxLinksBeforePenalty?: number;
}

const FALLBACK_SECRET = "kcg-spam-guard-public-fallback-v1-set-SPAM_GUARD_SECRET";
const DEFAULT_CONFIG: SpamGuardConfig = {};
const DEFAULT_PHRASES = [
  "seo", "search engine optimization", "first page of google", "page 1 of google",
  "rank higher", "ranking on google", "google rankings", "backlinks", "backlink",
  "guest post", "guest posting", "domain authority", "web design services",
  "website redesign services", "marketing agency", "digital marketing services",
  "increase your traffic", "boost your traffic", "more traffic to your website",
  "lead generation services", "i noticed your website", "i came across your website",
  "we can help your business", "outsourc", "virtual assistant services", "reply stop",
  'reply "stop"', "to unsubscribe", "unsubscribe", "opt out", "crypto", "bitcoin",
  "casino", "loan offer", "business funding", "merchant cash advance",
];

function signature(ts: string, config: SpamGuardConfig): string {
  return createHmac("sha256", config.secret ?? process.env.SPAM_GUARD_SECRET ?? FALLBACK_SECRET)
    .update(ts).digest("base64url");
}

export function issueFormToken(config: SpamGuardConfig = DEFAULT_CONFIG, now = Date.now()): string {
  if (!Number.isSafeInteger(now) || now < 0) throw new RangeError("now must be a non-negative safe integer");
  const ts = String(now);
  return `${ts}.${signature(ts, config)}`;
}

export function verifyFormToken(token: unknown, config: SpamGuardConfig = DEFAULT_CONFIG, now = Date.now()): { valid: boolean; ageMs?: number; reason?: string } {
  if (token === undefined || token === null || token === "") return { valid: false, reason: "missing_token" };
  if (typeof token !== "string" || token.length > 60) return { valid: false, reason: "invalid_token" };
  const match = /^(0|[1-9]\d{0,15})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match || !Number.isSafeInteger(Number(match[1])) || !Number.isFinite(now)) return { valid: false, reason: "invalid_token" };
  // Compare canonical encoded signatures: alternate base64 encodings are not accepted.
  if (!timingSafeEqual(Buffer.from(match[2]), Buffer.from(signature(match[1], config)))) return { valid: false, reason: "invalid_token" };
  const ageMs = now - Number(match[1]);
  if (ageMs < 0) return { valid: false, reason: "future_token" };
  if (ageMs > (config.maxTokenAgeMs ?? 86_400_000)) return { valid: false, ageMs, reason: "expired_token" };
  return { valid: true, ageMs };
}

export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const read = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === "function") return (headers as Headers).get(name) ?? undefined;
    const record = headers as Record<string, string | string[] | undefined>;
    const key = Object.keys(record).find(k => k.toLowerCase() === name);
    const value = key === undefined ? undefined : record[key];
    return Array.isArray(value) ? value[0] : value;
  };
  return read("x-forwarded-for")?.split(",")[0].trim() || read("x-real-ip")?.trim() || "unknown";
}

export function scoreText(text: string, config: SpamGuardConfig = DEFAULT_CONFIG): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => { score += points; reasons.push(reason); };
  const disabled = new Set((config.disablePhrases ?? []).map(p => p.trim().toLowerCase()));
  const phrases = new Set([
    ...DEFAULT_PHRASES.filter(p => !disabled.has(p)),
    ...(config.extraPhrases ?? []).map(p => p.trim().toLowerCase()).filter(Boolean),
  ]);
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // "outsourc" is intentionally a stem (outsource, outsourcing, outsourced).
    const suffix = phrase === "outsourc" ? "[\\p{L}]*" : "";
    if (new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}${suffix}(?![\\p{L}\\p{N}_])`, "iu").test(text)) add(3, `phrase:${phrase}`);
  }
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  if (links > (config.maxLinksBeforePenalty ?? 1)) add(links >= 4 ? 3 : 2, "links");
  const letters = text.match(/\p{L}/gu) ?? [];
  const foreign = letters.filter(c => /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(c)).length;
  if (letters.length && foreign / letters.length > 0.3) add(2, "cyrillic_cjk_heavy");
  if (text.length > 40 && /\p{Lu}/u.test(text) && !/\p{Ll}/u.test(text)) add(1, "all_caps");
  return { score, reasons };
}

type Buckets = Map<string, number[]>;
let rateLimits = new WeakMap<SpamGuardConfig, Buckets>();
export function __resetRateLimit(): void { rateLimits = new WeakMap(); }

function rateLimited(ip: string, now: number, config: SpamGuardConfig): boolean {
  const limit = config.rateLimit ?? { max: 5, windowMs: 600_000 };
  if (limit === false || !ip || ip === "unknown") return false;
  let buckets = rateLimits.get(config);
  if (!buckets) { buckets = new Map(); rateLimits.set(config, buckets); }
  // Prune every bucket, including IPs that never return. Keep at most max+1
  // recent timestamps per IP; that is sufficient for the sliding-window verdict.
  for (const [key, times] of buckets) {
    const active = times.filter(t => t > now - limit.windowMs);
    if (active.length) buckets.set(key, active); else buckets.delete(key);
  }
  const times = buckets.get(ip) ?? [];
  times.push(now);
  const exceeded = times.length > limit.max;
  buckets.set(ip, times.slice(-Math.max(1, limit.max + 1)));
  return exceeded;
}

export function stripGuardFields(fields: Record<string, unknown>, config: SpamGuardConfig = DEFAULT_CONFIG): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).filter(([key]) => key !== (config.honeypotField ?? "company_website") && key !== (config.tokenField ?? "_sg_t")));
}

export function classifySubmission(input: { fields: Record<string, unknown>; ip?: string; now?: number }, config: SpamGuardConfig = DEFAULT_CONFIG): { verdict: Verdict; reasons: string[]; score: number } {
  const { fields, ip = "unknown", now = Date.now() } = input;
  let score = 0;
  const reasons: string[] = [];
  const drop = (reason: string) => ({ verdict: "drop" as const, reasons: [...reasons, reason], score });
  const honeypot = fields[config.honeypotField ?? "company_website"];
  if (honeypot !== undefined && honeypot !== null && honeypot !== "") return drop("honeypot");
  const token = verifyFormToken(fields[config.tokenField ?? "_sg_t"], config, now);
  if (token.valid && token.ageMs! < (config.minSubmitMs ?? 3000)) return drop("too_fast");
  if (!token.valid) {
    if (config.requireToken) return drop(token.reason!);
    score += 2;
    reasons.push(token.reason!);
  }
  if (rateLimited(ip, now, config)) return drop("rate_limited");
  const text = Object.values(stripGuardFields(fields, config)).filter((v): v is string => typeof v === "string").join("\n");
  const content = scoreText(text, config);
  score += content.score;
  reasons.push(...content.reasons);
  return { verdict: score >= (config.spamThreshold ?? 3) ? "spam" : "ok", reasons, score };
}
