import type { IncomingMessage, ServerResponse } from 'node:http';
import { issueFormToken } from '../lib/spam-guard.js';
import { CONFIG } from '../lib/spam-guard-config.js';
import { writeJson } from '../lib/booking/validation.js';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    writeJson(res, 405, { success: false, message: 'Method not allowed.' });
    return;
  }
  writeJson(res, 200, { t: issueFormToken(CONFIG) });
}
