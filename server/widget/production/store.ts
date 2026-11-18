import { createHmac } from 'node:crypto';
import { readBoundedResponse } from '../../../src/lib/widget/strict-grounding/http-transport';
import type { ProductionConfig } from './config';
import { deadline } from './deadline';

export type RedisTransport = (command: (string | number)[]) => Promise<unknown>;
export const RECEIPT_SECONDS = 48 * 60 * 60;
// All admission counters and the optional lead claim change in one Redis transaction.
// No decrement/refund: ambiguous calls consume their full reservation.
export const ADMIT_LUA = `
local receipt = KEYS[7]
if ARGV[7] ~= '' then
  local old = redis.call('GET', receipt)
  if old then
    if string.sub(old,1,64) ~= ARGV[7] then return 'conflict' end
    return string.sub(old,66)
  end
end
local cost = tonumber(ARGV[3])
local limits = {30,150,tonumber(ARGV[4]),tonumber(ARGV[5]),tonumber(ARGV[1]),tonumber(ARGV[2])}
local deltas = {1,1,cost,cost,1,1}
for i=1,6 do
  if deltas[i] > 0 then
    local n = tonumber(redis.call('GET',KEYS[i]) or '0')
    if not n or n + deltas[i] > limits[i] then return 'limited' end
  end
end
for i=1,6 do
  if deltas[i] > 0 then
    redis.call('INCRBY',KEYS[i],deltas[i])
    if redis.call('TTL',KEYS[i]) < 0 then redis.call('EXPIRE',KEYS[i],(i == 3 or i == 4) and 86400 or 600) end
  end
end
if ARGV[7] ~= '' then redis.call('SET',receipt,ARGV[7] .. ':pending','EX',ARGV[6]) end
return 'claimed'
`;
export const FINISH_LUA = `
if redis.call('GET',KEYS[1]) ~= ARGV[1] .. ':pending' then return 0 end
redis.call('SET',KEYS[1],ARGV[1] .. ':' .. ARGV[2],'KEEPTTL')
return 1
`;

export function restTransport(config: ProductionConfig, run: typeof fetch = fetch): RedisTransport {
  return command => deadline(2500, async signal => {
    if (!config.storage) throw Error('Storage unavailable');
    const response = await run(config.redisUrl, { method: 'POST', redirect: 'error', credentials: 'omit', cache: 'no-store',
      headers: { authorization: `Bearer ${config.redisToken}`, 'content-type': 'application/json' },
      body: JSON.stringify(command), signal });
    if (!response.ok) { await response.body?.cancel(); throw Error('Storage unavailable'); }
    const data = await readBoundedResponse(response) as { result?: unknown; error?: unknown };
    if (!data || data.error || !Object.hasOwn(data, 'result')) throw Error('Storage unavailable');
    return data.result;
  });
}
export class SharedStore {
  constructor(private config: ProductionConfig, private run: RedisTransport) {}
  hash(domain: string, value: string) { return createHmac('sha256', this.config.secret).update(domain + '\0' + value).digest('hex'); }
  async ready() { return this.config.storage && await this.run(['PING']) === 'PONG'; }
  receipt(id: string) { return `kcg:{widget}:receipt:${this.hash('receipt', id)}`; }
  async admit(ip: string, kind: 'hosted' | 'lead', id = '', digest = '') {
    if (!this.config.storage) throw Error('Storage unavailable');
    const cost = kind === 'hosted' ? this.config.reserve : 0;
    const who = this.hash('ip', ip);
    // Shared across instances AND paths. Leads additionally have their own tight request caps.
    const keys = [`kcg:{widget}:requests:ip:${who}`, 'kcg:{widget}:requests:global',
      `kcg:{widget}:spend:ip:${who}`, 'kcg:{widget}:spend:global',
      `kcg:{widget}:${kind}:ip:${who}`, `kcg:{widget}:${kind}:global`, this.receipt(id)];
    const value = await this.run(['EVAL', ADMIT_LUA, 7, ...keys, kind === 'hosted' ? 12 : 3, kind === 'hosted' ? 120 : 30,
      cost, this.config.ipSpend, this.config.globalSpend, RECEIPT_SECONDS, digest]);
    if (typeof value !== 'string' || !['claimed','limited','conflict','pending','accepted','unknown'].includes(value)) throw Error('Invalid admission');
    return value;
  }
  async finish(id: string, digest: string, status: 'accepted' | 'unknown') {
    if (await this.run(['EVAL', FINISH_LUA, 1, this.receipt(id), digest, status]) !== 1) throw Error('Receipt unavailable');
  }
}
