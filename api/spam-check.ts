import type { ServerResponse } from 'node:http';
import { classifySubmission, getClientIp } from '../lib/spam-guard.js';
import { CONFIG } from '../lib/spam-guard-config.js';
import { readJsonObject, writeJson, type BookingIncoming } from '../lib/booking/validation.js';

export default async function handler(req: BookingIncoming, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    writeJson(res, 405, { success: false, message: 'Method not allowed.' });
    return;
  }
  const raw = await readJsonObject(req);
  if (!raw.ok) {
    writeJson(res, 400, { success: false, message: 'The request was invalid.' });
    return;
  }
  const { verdict, reasons } = classifySubmission({ fields: raw.value, ip: getClientIp(req.headers) }, CONFIG);
  if (verdict !== 'ok') {
    console.warn('[spam-guard]', verdict, reasons);
  }
  writeJson(res, 200, { success: true, deliver: verdict === 'ok' });
}
