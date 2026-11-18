export const RESERVED_INPUT_TOKENS = 20_000;
export const MAX_OUTPUT_TOKENS = 400;
export type ProductionConfig = ReturnType<typeof productionConfig>;
const integer = (value: string | undefined, max: number) => value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= max ? Number(value) : 0;

/** No dotenv, client secrets, preview activation, or configurable provider destinations. */
export function productionConfig(env: NodeJS.ProcessEnv = process.env) {
  let redisUrl = '';
  try {
    const u = new URL(env.KCG_WIDGET_REDIS_REST_URL || '');
    if (u.protocol === 'https:' && /^[a-z0-9-]+\.upstash\.io$/.test(u.hostname) && !u.username && !u.password && !u.port && u.pathname === '/' && !u.search && !u.hash) redisUrl = u.origin;
  } catch { /* unconfigured */ }
  const secret = env.KCG_WIDGET_HMAC_SECRET || '';
  const production = env.NODE_ENV === 'production' && env.VERCEL_ENV === 'production' && env.VERCEL === '1';
  const storage = production && !!redisUrl && !!env.KCG_WIDGET_REDIS_REST_TOKEN && Buffer.byteLength(secret) >= 32;
  const inputPrice = integer(env.KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN, 10000);
  const outputPrice = integer(env.KCG_WIDGET_OUTPUT_MICROUSD_PER_TOKEN, 10000);
  // Reserve a token per request byte plus framing headroom; no optimistic tokenizer estimate.
  const reserve = RESERVED_INPUT_TOKENS * inputPrice + MAX_OUTPUT_TOKENS * outputPrice;
  const globalSpend = integer(env.KCG_WIDGET_GLOBAL_DAILY_MICROUSD, 100000000);
  const ipSpend = integer(env.KCG_WIDGET_IP_DAILY_MICROUSD, 10000000);
  const modelAllowed = !env.KCG_WIDGET_RESPONSES_MODEL || env.KCG_WIDGET_RESPONSES_MODEL === 'gpt-6-luna';
  const key = env.KCG_WIDGET_OPENAI_API_KEY || '';
  // Reuse exactly the existing site's Web3Forms destination key, never a caller-supplied key.
  const contactKey = env.VITE_WEB3FORMS_ACCESS_KEY || '';
  return { production, storage, redisUrl, redisToken: env.KCG_WIDGET_REDIS_REST_TOKEN || '', secret,
    hosted: storage && env.KCG_WIDGET_HOSTED_ENABLE === '1' && modelAllowed && !!key && !key.startsWith('fixture-') && inputPrice > 0 && outputPrice > 0 && reserve <= ipSpend && reserve <= globalSpend,
    lead: storage && env.KCG_WIDGET_LEAD_ENABLE === '1' && /^[a-f0-9-]{36}$/i.test(contactKey),
    key, contactKey, reserve, ipSpend, globalSpend };
}
