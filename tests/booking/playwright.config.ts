import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const harnessUrl = `http://127.0.0.1:${process.env.BOOKING_HARNESS_PORT || 4173}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: '.',
  testMatch: 'browser.spec.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BOOKING_PREVIEW_URL || harnessUrl,
    storageState: process.env.BOOKING_PREVIEW_STORAGE_STATE,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    ignoreHTTPSErrors: true,
  },
  webServer: process.env.BOOKING_PREVIEW_URL ? undefined : {
    command: 'node --import tsx tests/booking/local-server.ts --harness',
    cwd: root,
    url: harnessUrl,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
