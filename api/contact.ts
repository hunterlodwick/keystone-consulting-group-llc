import type { ServerResponse } from 'node:http';
import { classifySubmission, getClientIp, stripGuardFields } from '../lib/spam-guard.js';
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
    writeJson(res, 200, { success: true, message: 'ok' });
    return;
  }
  const fields = stripGuardFields(raw.value, CONFIG);
  const access_key = process.env.WEB3FORMS_ACCESS_KEY ?? process.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!access_key) {
    writeJson(res, 503, { success: false, message: 'Contact form unavailable.' });
    return;
  }
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...fields, access_key }),
      signal: AbortSignal.timeout(15_000),
    });
    writeJson(res, response.status, await response.json());
  } catch {
    writeJson(res, 503, { success: false, message: 'Contact form unavailable.' });
  }
}
