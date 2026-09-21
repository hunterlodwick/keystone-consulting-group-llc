import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type Server, type ServerResponse } from 'node:http';
import path from 'node:path';
import { handleBookRequest } from '../../api/booking/book';
import { handleSlotsRequest } from '../../api/booking/slots';
import {
  type BookingInviteIntent,
  type GoogleFetch,
} from '../../lib/booking/google';

export type FakeBusy = { start: string; end: string };

export type InsertMode =
  | 'ok'
  | 'ok201'
  | 'ok202'
  | 'ok206'
  | 'ok299'
  | 'duplicate'
  | 'timeout'
  | 'conference'
  | 'invalidConferenceType'
  | 'unrelated400'
  | 'server500'
  | 'rateLimitConference'
  | 'quota'
  | 'forbidden';

export type FakeGoogleCounts = {
  token: number;
  freebusy: number;
  insert: number;
  realWrites: number;
  realInvites: number;
};

export type CapturedInsert = {
  url: string;
  body: Record<string, unknown>;
  sendUpdates: string | null;
  conferenceDataVersion: string | null;
  attendees: unknown;
  conferenceRequestId: string | null;
};

export type FakeGoogleTransport = {
  fetchImpl: GoogleFetch;
  counts: FakeGoogleCounts;
  calls: string[];
  insertRequests: CapturedInsert[];
  inviteIntents: BookingInviteIntent[];
  recordIntent: (intent: BookingInviteIntent) => void;
  setBusy: (busy: FakeBusy[]) => void;
  setFreebusyQueue: (queue: FakeBusy[][]) => void;
  setFreeBusyPayload: (payload: unknown | null) => void;
  setInsertMode: (mode: InsertMode) => void;
  setCalendarErrors: (errors: Array<{ reason: string }> | null) => void;
  omitCalendar: (omit: boolean) => void;
};

const SPA_HTML = '<!doctype html><html><head><title>KCG</title></head><body>SPA</body></html>';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safeFilePath(root: string, urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(`${rootResolved}${path.sep}`)) {
    return null;
  }
  return resolved;
}

async function sendFile(res: ServerResponse, filePath: string, spaIndex: string): Promise<void> {
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      return sendFile(res, spaIndex, spaIndex);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
    createReadStream(filePath).pipe(res);
  } catch {
    if (filePath !== spaIndex && existsSync(spaIndex)) {
      return sendFile(res, spaIndex, spaIndex);
    }
    res.statusCode = 404;
    res.end('not found');
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isGoogleUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'oauth2.googleapis.com' || host === 'www.googleapis.com' || host.endsWith('.googleapis.com');
  } catch {
    return false;
  }
}

export function createFakeGoogleTransport(): FakeGoogleTransport {
  let busy: FakeBusy[] = [];
  let freebusyQueue: FakeBusy[][] | null = null;
  let freeBusyPayload: unknown | null = null;
  let insertMode: InsertMode = 'ok';
  let calendarErrors: Array<{ reason: string }> | null = null;
  let omitCal = false;
  const counts: FakeGoogleCounts = {
    token: 0,
    freebusy: 0,
    insert: 0,
    realWrites: 0,
    realInvites: 0,
  };
  const calls: string[] = [];
  const insertRequests: CapturedInsert[] = [];
  const inviteIntents: BookingInviteIntent[] = [];

  const captureInsert = (url: string, init?: RequestInit): CapturedInsert => {
    const parsedUrl = new URL(url);
    let body: Record<string, unknown> = {};
    if (typeof init?.body === 'string') {
      try {
        body = JSON.parse(init.body) as Record<string, unknown>;
      } catch {
        body = {};
      }
    }
    const conference = body.conferenceData as
      | { createRequest?: { requestId?: string } }
      | undefined;
    const captured: CapturedInsert = {
      url,
      body,
      sendUpdates: parsedUrl.searchParams.get('sendUpdates'),
      conferenceDataVersion: parsedUrl.searchParams.get('conferenceDataVersion'),
      attendees: body.attendees,
      conferenceRequestId: conference?.createRequest?.requestId ?? null,
    };
    insertRequests.push(captured);
    inviteIntents.push({
      sendUpdates: 'all',
      conferenceDataVersion: captured.conferenceDataVersion === '1' ? 1 : null,
      attendees: Array.isArray(body.attendees)
        ? (body.attendees as BookingInviteIntent['attendees'])
        : [],
      conferenceRequestId: captured.conferenceRequestId,
      includeConference: Boolean(body.conferenceData),
      summary: typeof body.summary === 'string' ? body.summary : '',
    });
    return captured;
  };

  const fetchImpl: GoogleFetch = async (input, init) => {
    const url = String(input);
    if (!isGoogleUrl(url)) {
      throw new Error('unexpected non-Google URL in fake transport');
    }

    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      counts.token += 1;
      calls.push('token');
      return jsonResponse({ access_token: 'fake-access-token', expires_in: 3600, token_type: 'Bearer' });
    }

    if (url.startsWith('https://www.googleapis.com/calendar/v3/freeBusy')) {
      counts.freebusy += 1;
      calls.push('freebusy');
      const rawBody = typeof init?.body === 'string' ? init.body : init?.body instanceof URLSearchParams ? init.body.toString() : String(init?.body ?? '{}');
      let calendarId = 'unknown';
      try {
        calendarId = JSON.parse(rawBody).items[0].id;
      } catch {
        calendarId = 'unknown';
      }
      if (omitCal) {
        return jsonResponse({ calendars: {} });
      }
      if (freeBusyPayload !== null) {
        return jsonResponse(freeBusyPayload);
      }
      const slice = freebusyQueue && freebusyQueue.length > 0 ? freebusyQueue.shift()! : busy;
      return jsonResponse({
        calendars: {
          [calendarId]: {
            ...(calendarErrors ? { errors: calendarErrors } : {}),
            busy: slice,
          },
        },
      });
    }

    if (url.includes('/calendar/v3/calendars/') && url.includes('/events')) {
      counts.insert += 1;
      calls.push('insert');
      const captured = captureInsert(url, init);
      if (insertMode === 'timeout') {
        const signal = init?.signal;
        await new Promise<never>((_resolve, reject) => {
          const abort = () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          };
          if (signal?.aborted) {
            abort();
            return;
          }
          signal?.addEventListener('abort', abort, { once: true });
        });
      }
      if (insertMode === 'duplicate') {
        return jsonResponse(
          { error: { code: 409, errors: [{ reason: 'duplicate' }], message: 'The requested identifier already exists.' } },
          409,
        );
      }
      if (insertMode === 'conference' && captured.body.conferenceData) {
        return jsonResponse(
          { error: { code: 400, message: 'Invalid conference type hangoutsMeet' } },
          400,
        );
      }
      if (insertMode === 'invalidConferenceType' && captured.body.conferenceData) {
        return jsonResponse(
          {
            error: {
              errors: [{ reason: 'invalidConferenceType' }],
              message: 'Conference type hangoutsMeet is not allowed.',
            },
          },
          400,
        );
      }
      if (insertMode === 'rateLimitConference') {
        return jsonResponse(
          {
            error: {
              errors: [{ domain: 'usageLimits', reason: 'rateLimitExceeded' }],
              message: 'Rate limit exceeded while processing conferenceData.',
            },
          },
          403,
        );
      }
      if (insertMode === 'quota') {
        return jsonResponse(
          {
            error: {
              errors: [{ domain: 'usageLimits', reason: 'quotaExceeded' }],
              message: 'Quota exceeded.',
            },
          },
          403,
        );
      }
      if (insertMode === 'forbidden') {
        return jsonResponse(
          {
            error: {
              errors: [{ domain: 'global', reason: 'forbidden' }],
              message: 'The user is not authorized.',
            },
          },
          403,
        );
      }
      if (insertMode === 'unrelated400') {
        return jsonResponse({ error: { code: 400, message: 'Required field missing' } }, 400);
      }
      if (insertMode === 'server500') {
        return jsonResponse({ error: { code: 500, message: 'backendError' } }, 500);
      }
      const created = {
        id: 'fake-event-id',
        status: 'confirmed',
        conferenceData: captured.body.conferenceData
          ? { createRequest: { status: { statusCode: 'pending' } } }
          : undefined,
      };
      const successStatus =
        insertMode === 'ok201'
          ? 201
          : insertMode === 'ok202'
            ? 202
            : insertMode === 'ok206'
              ? 206
              : insertMode === 'ok299'
                ? 299
                : 200;
      return jsonResponse(created, successStatus);
    }

    counts.realWrites += 1;
    throw new Error('blocked unexpected Google URL');
  };

  return {
    fetchImpl,
    counts,
    calls,
    insertRequests,
    inviteIntents,
    recordIntent: (intent) => {
      inviteIntents.push(intent);
    },
    setBusy: (next) => {
      busy = next;
    },
    setFreebusyQueue: (queue) => {
      freebusyQueue = queue;
    },
    setFreeBusyPayload: (payload) => {
      freeBusyPayload = payload;
    },
    setInsertMode: (mode) => {
      insertMode = mode;
    },
    setCalendarErrors: (errors) => {
      calendarErrors = errors;
    },
    omitCalendar: (omit) => {
      omitCal = omit;
    },
  };
}

export type LocalServer = {
  url: string;
  close: () => Promise<void>;
  transport: FakeGoogleTransport | null;
};

export async function startLocalBookingServer(args: {
  env: NodeJS.ProcessEnv | Record<string, string | undefined>;
  now: () => Date;
  transport?: FakeGoogleTransport | null;
  serveDir?: string;
  listen?: { host?: string; port?: number };
}): Promise<LocalServer> {
  const transport = args.transport === undefined ? createFakeGoogleTransport() : args.transport;
  const deps = {
    env: args.env,
    now: args.now,
    ...(transport
      ? {
          fetchImpl: transport.fetchImpl,
          onDryRunIntent: (intent: BookingInviteIntent) => {
            transport.inviteIntents.push(intent);
          },
        }
      : {}),
  };
  const serveDir = args.serveDir ? path.resolve(args.serveDir) : null;
  const spaIndex = serveDir ? path.join(serveDir, 'index.html') : null;

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/__booking/test/safety') {
      res.statusCode = 200;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          token: transport?.counts.token ?? 0,
          freebusy: transport?.counts.freebusy ?? 0,
          insert: transport?.counts.insert ?? 0,
          realWrites: transport?.counts.realWrites ?? 0,
          realInvites: transport?.counts.realInvites ?? 0,
          insertRequests: transport?.insertRequests.length ?? 0,
          dryRunIntents: transport?.inviteIntents.length ?? 0,
        }),
      );
      return;
    }
    if (url.pathname === '/api/booking/slots') {
      void handleSlotsRequest(req, res, deps);
      return;
    }
    if (url.pathname === '/api/booking/book') {
      void handleBookRequest(req, res, deps);
      return;
    }
    if (serveDir && spaIndex) {
      const filePath = safeFilePath(serveDir, url.pathname === '/' ? '/index.html' : url.pathname);
      if (!filePath) {
        res.statusCode = 400;
        res.end('bad path');
        return;
      }
      void sendFile(res, filePath, spaIndex);
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(SPA_HTML);
  });

  const host = args.listen?.host ?? '127.0.0.1';
  const port = args.listen?.port ?? 0;
  await new Promise<void>((resolve) => server.listen(port, host, () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('failed to bind local booking server');
  }
  return {
    url: `http://${host}:${address.port}`,
    transport,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

if (process.argv.includes('--harness')) {
  const dist = path.resolve(process.cwd(), 'dist');
  if (!existsSync(path.join(dist, 'index.html'))) {
    throw new Error('dist/index.html missing; run npm run build before the browser harness');
  }
  const port = Number(process.env.BOOKING_HARNESS_PORT ?? 4173);
  await startLocalBookingServer({
    env: {
      BOOKING_DRY_RUN: 'true',
      BOOKING_TZ: 'America/Denver',
      BOOKING_CALENDAR_ID: 'seth-test@example.com',
      GOOGLE_CLIENT_ID: 'fake-client-id',
      GOOGLE_CLIENT_SECRET: 'fake-client-secret',
      GOOGLE_REFRESH_TOKEN: 'fake-refresh-token',
    },
    now: () => new Date(),
    serveDir: dist,
    listen: { host: '127.0.0.1', port },
  });
  console.log(`booking-harness http://127.0.0.1:${port}`);
}
