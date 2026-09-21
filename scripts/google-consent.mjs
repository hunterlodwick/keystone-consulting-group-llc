#!/usr/bin/env node
/**
 * Operator-only Google consent for the KCG booking calendar.
 * Desktop OAuth + loopback redirect + PKCE S256 + offline access.
 * Do not run this from CI or the executor. Never writes tokens to disk.
 *
 * Least-required scopes verified from Calendar API auth tables:
 *   events.insert -> https://www.googleapis.com/auth/calendar.events.owned
 *   freeBusy.query -> https://www.googleapis.com/auth/calendar.freebusy
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { stdin as stdinStream, stdout as stdoutStream } from 'node:process';
import readline from 'node:readline';
import { pathToFileURL } from 'node:url';

export const CONSENT_SCOPES = [
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events.owned',
];

export const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

export function base64Url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createPkcePair() {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge, method: 'S256' };
}

export function createState() {
  return base64Url(randomBytes(24));
}

export function statesEqual(expected, actual) {
  if (typeof expected !== 'string' || typeof actual !== 'string') return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function buildAuthorizationUrl({ clientId, redirectUri, state, challenge, scopes }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: (scopes ?? CONSENT_SCOPES).join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export async function exchangeAuthorizationCode({
  fetchImpl,
  clientId,
  clientSecret,
  code,
  codeVerifier,
  redirectUri,
}) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const response = await fetchImpl(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  let json = {};
  try {
    json = await response.json();
  } catch {
    json = {};
  }
  if (!response.ok || typeof json.refresh_token !== 'string' || json.refresh_token.length === 0) {
    const err = new Error('token_exchange_failed');
    err.code = 'TOKEN_EXCHANGE_FAILED';
    throw err;
  }
  return {
    refreshToken: json.refresh_token,
    scope: typeof json.scope === 'string' ? json.scope : '',
    refreshTokenExpiresIn:
      typeof json.refresh_token_expires_in === 'number' ? json.refresh_token_expires_in : null,
  };
}

async function promptHidden(label) {
  stdoutStream.write(label);
  return new Promise((resolve, reject) => {
    const stdin = stdinStream;
    if (typeof stdin.setRawMode === 'function') stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '\u0004') {
        cleanup();
        stdoutStream.write('\n');
        resolve(value);
      } else if (ch === '\u0003') {
        cleanup();
        reject(new Error('interrupted'));
      } else if (ch === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    const cleanup = () => {
      stdin.off('data', onData);
      if (typeof stdin.setRawMode === 'function') stdin.setRawMode(false);
      stdin.pause();
    };
    stdin.on('data', onData);
  });
}

async function promptLine(label) {
  const rl = readline.createInterface({ input: stdinStream, output: stdoutStream });
  const answer = await new Promise((resolve) => rl.question(label, resolve));
  rl.close();
  return String(answer).trim();
}

function copyToClipboard(value) {
  return new Promise((resolve, reject) => {
    const child = spawn('pbcopy');
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('clipboard_failed'));
    });
    child.stdin.write(value);
    child.stdin.end();
  });
}

function openBrowser(url) {
  spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
}

async function readOperatorCredentials() {
  const envId = process.env.GOOGLE_CLIENT_ID?.trim();
  const envSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const clientId = envId && envId.length > 0 ? envId : await promptLine('Desktop OAuth client ID: ');
  const clientSecret =
    envSecret && envSecret.length > 0
      ? envSecret
      : await promptHidden('Desktop OAuth client secret (input hidden): ');
  if (!clientId || !clientSecret) {
    throw new Error('missing_client');
  }
  return { clientId, clientSecret };
}

export function startConsentListener(state) {
  let settleCode;
  let settleErr;
  const codePromise = new Promise((resolve, reject) => {
    settleCode = resolve;
    settleErr = reject;
  });
  const started = new Promise((resolveStarted) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      const returnedState = url.searchParams.get('state') ?? '';
      const code = url.searchParams.get('code');
      const err = url.searchParams.get('error');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('You can close this tab and return to the terminal.');
      server.close();
      if (err || !code || !statesEqual(state, returnedState)) {
        settleErr(new Error('consent_callback_rejected'));
        return;
      }
      settleCode(code);
    });
    server.listen(0, '127.0.0.1', () => {
      const redirectUri = `http://127.0.0.1:${server.address().port}`;
      resolveStarted({ server, redirectUri });
    });
  });
  return { started, codePromise };
}

async function main() {
  const { clientId, clientSecret } = await readOperatorCredentials();
  const { verifier, challenge } = createPkcePair();
  const state = createState();
  const { started, codePromise } = startConsentListener(state);
  const { redirectUri } = await started;
  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    challenge,
  });
  console.log('Opening the system browser for Google consent.');
  console.log('The authorization URL is not printed because it contains a client identifier.');
  console.log('Waiting for the loopback callback.');
  openBrowser(authUrl);
  const code = await codePromise;
  const tokens = await exchangeAuthorizationCode({
    fetchImpl: fetch,
    clientId,
    clientSecret,
    code,
    codeVerifier: verifier,
    redirectUri,
  });
  if (tokens.refreshTokenExpiresIn) {
    console.log('Google returned a refresh token lifetime. Confirm consent-screen mode before live use.');
  }
  if (tokens.scope) {
    const granted = new Set(tokens.scope.split(/\s+/).filter(Boolean));
    const missing = CONSENT_SCOPES.filter((scope) => !granted.has(scope));
    if (missing.length > 0) {
      console.log('Granted scopes did not include every requested calendar scope. Do not activate live booking.');
    }
  }
  try {
    await copyToClipboard(tokens.refreshToken);
    console.log('The refresh token was copied to your clipboard.');
    console.log('Store it in your password manager, then set GOOGLE_REFRESH_TOKEN in Vercel env.');
    console.log('It was not written to disk and is not printed here.');
  } catch {
    console.error('Clipboard copy failed. The token was not printed. Re-run the script.');
    process.exit(1);
  }
}

const invokedDirectly = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch(() => {
    console.error('Consent failed. No token was printed or saved.');
    process.exit(1);
  });
}
