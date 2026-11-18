import { build } from 'esbuild';
import { rm } from 'node:fs/promises';

const outdir = 'server/generated/functions';
await rm(outdir, { recursive: true, force: true });
// Inline local modules, JSON, and dependencies: plain Node ESM needs no TS loader.
await build({
  entryPoints: {
    widget: 'server/widget/handler.ts',
    slots: 'server/booking/slots.ts',
    book: 'server/booking/book.ts',
  },
  outdir,
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  logLevel: 'info',
});
