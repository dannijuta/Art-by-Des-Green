#!/usr/bin/env node
/**
 * One-off local seeding that talks to PGlite in-process (no TCP socket bridge)
 * to avoid the socket bridge's instability under a large multi-statement
 * transaction. Only for local dev testing — production always writes through
 * the real Supabase Postgres connection via the ordinary import script.
 */
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from '../lib/slugify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const dataDir = path.resolve(ROOT, '.local-pg-data');

const db = new PGlite(dataDir, { extensions: { pgcrypto, pg_trgm } });
await db.waitReady;

for (const file of ['0001_schema.sql', '0003_seed_settings.sql', '0004_search.sql', '0005_image_dimensions.sql']) {
  const sql = fs.readFileSync(path.join(ROOT, 'supabase/migrations', file), 'utf8');
  await db.exec(sql);
  console.log('applied', file);
}

const records = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/output/artworks.seed.json'), 'utf8'));

const categoryIds = new Map();
for (const name of [...new Set(records.map((r) => r.category).filter(Boolean))]) {
  const res = await db.query('insert into categories (name, slug) values ($1,$2) on conflict (name) do update set name = excluded.name returning id', [
    name,
    slugify(name),
  ]);
  categoryIds.set(name, res.rows[0].id);
}

for (const rec of records) {
  await db.query(
    `insert into artworks (
      rank, slug, public_title, working_description, category_id,
      width_cm, height_cm, medium, surface, framed, price_cents,
      primary_image_path, primary_image_width, primary_image_height,
      internal_launch_priority, internal_sellability_tier, internal_selling_note, internal_notes,
      availability_status, publishing_status
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
    on conflict (rank) do update set
      slug = excluded.slug, public_title = excluded.public_title, working_description = excluded.working_description,
      category_id = excluded.category_id, width_cm = excluded.width_cm, height_cm = excluded.height_cm,
      medium = excluded.medium, surface = excluded.surface, framed = excluded.framed, price_cents = excluded.price_cents,
      primary_image_path = excluded.primary_image_path, primary_image_width = excluded.primary_image_width,
      primary_image_height = excluded.primary_image_height`,
    [
      rec.rank,
      rec.slug,
      rec.publicTitle,
      rec.workingDescription,
      rec.category ? categoryIds.get(rec.category) : null,
      rec.widthCm,
      rec.heightCm,
      rec.medium,
      rec.surface,
      rec.framed,
      rec.priceCents,
      rec.imagePublicPath,
      rec.imageWidthPx,
      rec.imageHeightPx,
      rec.internal.launchPriority,
      rec.internal.sellabilityTier,
      rec.internal.sellingNote,
      rec.internal.notes,
      // Test-only convenience: publish everything with a price as available,
      // everything else as gallery-only, one as sold, four featured — mirrors
      // what an admin would set by hand. Not part of the real import script.
      rec.priceCents !== null ? 'available' : 'gallery_only',
      'published',
    ]
  );
}

await db.query('update artworks set availability_status = $1 where rank = 9', ['sold']);
await db.query('update artworks set is_featured = true where rank in (1,2,6,8)');
await db.query('update artworks set is_hero = true where rank = 1');

const bcrypt = await import('bcryptjs');
const hash = await bcrypt.default.hash('DevTestPassword123!', 12);
await db.query(
  `insert into admin_users (email, password_hash, name, role) values ($1,$2,$3,$4)
   on conflict (email) do update set password_hash = excluded.password_hash`,
  ['dev@artbydesgreen.local', hash, 'Dev Admin', 'owner']
);

const count = await db.query('select count(*) from artworks');
console.log('artworks seeded:', count.rows[0].count);

await db.close();
console.log('done — data written to', dataDir);
