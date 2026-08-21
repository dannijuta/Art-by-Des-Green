#!/usr/bin/env node
/**
 * Dev/test-only embedded Postgres.
 *
 * This is NOT part of the deployed app — it exists purely so this project can
 * be built and its data layer exercised for real in an environment with no
 * Docker and no ability to install/administer a system Postgres service. It
 * runs PGlite (real Postgres compiled to WASM) in-process and exposes it over
 * the standard Postgres wire protocol on 127.0.0.1, so the ordinary `pg`
 * driver — the same one the app uses against Supabase in production — can
 * connect to it with a normal postgres:// connection string.
 *
 * Usage: node scripts/dev/local-db.mjs [port]
 */
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../.local-pg-data');
const port = Number(process.argv[2] || 55432);

const db = new PGlite(dataDir, { extensions: { pgcrypto, pg_trgm } });
await db.waitReady;

const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
await server.start();

console.log(`Local dev Postgres (PGlite) listening on 127.0.0.1:${port}`);
console.log(`Connection string: postgres://postgres:postgres@127.0.0.1:${port}/postgres`);
console.log('Press Ctrl+C to stop.');

process.on('SIGINT', async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
