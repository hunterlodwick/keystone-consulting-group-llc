import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'attribution.spec.ts',
  use: { ...base.use, baseURL: process.env.BOOKING_PREVIEW_URL || 'http://127.0.0.1:4186' },
  webServer: process.env.BOOKING_PREVIEW_URL ? undefined : {
    ...(base.webServer as object),
    command: 'BOOKING_HARNESS_PORT=4186 node --import tsx tests/booking/local-server.ts --harness',
    url: 'http://127.0.0.1:4186',
  },
});
