#!/usr/bin/env node
/**
 * Art by Des Green — catalogue importer.
 *
 * Reads the "Rankings + Images" sheet of the VISUAL_MASTER workbook, matches each
 * row to its source image by the two-digit rank prefix in the filename, validates
 * everything, copies originals into public/images/artworks/originals, and writes:
 *   - scripts/output/import-report.json   (full audit trail)
 *   - scripts/output/artworks.seed.json   (clean records ready to seed the database)
 *
 * If DATABASE_URL is set, it also upserts the data directly into Postgres.
 * Rows already edited by the admin dashboard (admin_edited = true) are left alone
 * unless their rank is passed via --force, per the "don't clobber admin edits" rule.
 *
 * Usage:
 *   node scripts/import-artworks.mjs [--source <xlsx path>] [--images <folder>] [--force rank1,rank2|all] [--apply]
 *
 * --apply actually writes to the database (requires DATABASE_URL). Without it,
 * the script always still produces the report + seed JSON + copies images, so it's
 * safe to run repeatedly while checking data quality.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import sharp from 'sharp';
import { slugify } from './lib/slugify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  return args[i + 1];
}
const APPLY = args.includes('--apply');
const FORCE = argValue('--force', '');
const forceAll = FORCE === 'all';
const forceRanks = new Set(
  forceAll ? [] : FORCE.split(',').map((s) => s.trim()).filter(Boolean).map(Number)
);

const SOURCE_XLSX = path.resolve(
  ROOT,
  argValue('--source', 'data/source/Art_by_Des_Green_VISUAL_MASTER.xlsm')
);
const IMAGES_DIR = path.resolve(
  ROOT,
  argValue(
    '--images',
    '../Art_by_Des_Green_All_Images/Art_by_Des_Green_All_Images'
  )
);
const OUT_DIR = path.resolve(ROOT, 'scripts/output');
const IMAGE_DEST_DIR = path.resolve(ROOT, 'public/images/artworks/originals');

const EXPECTED_RANKS = 68;
const NO_PRICE_TOKENS = new Set(['', 'na', 'n/a', 'tbc', 'tbd', 'unknown', '0', 'r0', 'r0.00']);

function readWorkbook(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Spreadsheet not found at ${file}`);
  }
  const wb = XLSX.readFile(file, { cellDates: true });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes('ranking'));
  if (!sheetName) {
    throw new Error(
      `Could not find a "Rankings + Images" sheet. Sheets present: ${wb.SheetNames.join(', ')}`
    );
  }
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c !== null && c !== ''));
  return dataRows.map((r) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = r[i];
    });
    return obj;
  });
}

function parsePrice(raw) {
  if (raw === null || raw === undefined) return { cents: null, invalid: false };
  const str = String(raw).trim();
  const normalized = str.toLowerCase().replace(/\s+/g, '');
  if (NO_PRICE_TOKENS.has(normalized)) return { cents: null, invalid: false };
  const numeric = str.replace(/[^0-9.]/g, '');
  if (!numeric) return { cents: null, invalid: str.length > 0 };
  const value = Number.parseFloat(numeric);
  if (!Number.isFinite(value) || value <= 0) return { cents: null, invalid: true };
  return { cents: Math.round(value * 100), invalid: false };
}

function parseDimension(raw) {
  if (raw === null || raw === undefined || raw === '') return { value: null, invalid: false };
  const value = typeof raw === 'number' ? raw : Number.parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(value) || value <= 0) return { value: null, invalid: true };
  return { value: Math.round(value * 10) / 10, invalid: false };
}

function parseFramed(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const str = String(raw).trim().toLowerCase();
  if (str === 'yes') return true;
  if (str === 'no') return false;
  return null;
}

function cleanText(raw) {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  return str.length ? str : null;
}

function fileChecksum(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function run() {
  const report = {
    generatedAt: new Date().toISOString(),
    source: SOURCE_XLSX,
    imagesDir: IMAGES_DIR,
    rowsRead: 0,
    imported: 0,
    updated: 0,
    skippedAdminEdited: 0,
    missingImages: [],
    duplicateImagePrefixes: [],
    duplicateImageContent: [],
    imagesWithoutRows: [],
    rowsWithoutRank: 0,
    invalidPrices: [],
    invalidDimensions: [],
    missingRanks: [],
    duplicateRanks: [],
    warnings: [],
  };

  const rawRows = readWorkbook(SOURCE_XLSX);
  report.rowsRead = rawRows.length;

  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`Images folder not found at ${IMAGES_DIR}`);
  }
  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  // Build rank -> image filename map, detecting duplicate prefixes.
  const imagesByRank = new Map();
  const usedImageFiles = new Set();
  for (const file of imageFiles) {
    const match = file.match(/^(\d{2})\s*-\s*/);
    if (!match) continue;
    const rank = Number(match[1]);
    if (imagesByRank.has(rank)) {
      report.duplicateImagePrefixes.push({ rank, files: [imagesByRank.get(rank), file] });
      continue;
    }
    imagesByRank.set(rank, file);
  }

  // Duplicate content detection across all matched images.
  const checksums = new Map();
  for (const [rank, file] of imagesByRank.entries()) {
    const sum = fileChecksum(path.join(IMAGES_DIR, file));
    if (checksums.has(sum)) {
      report.duplicateImageContent.push({ ranks: [checksums.get(sum), rank], files: [file] });
    } else {
      checksums.set(sum, rank);
    }
  }

  const records = [];
  const seenRanks = new Set();
  const seenSlugs = new Map();

  for (const row of rawRows) {
    const rank = row['Rank'];
    if (rank === null || rank === undefined || rank === '') {
      report.rowsWithoutRank += 1;
      continue;
    }
    if (seenRanks.has(rank)) {
      report.duplicateRanks.push(rank);
      continue;
    }
    seenRanks.add(rank);

    const workingDescription = cleanText(row['Working Description']);
    const actualTitle = cleanText(row['Actual Title']);
    const publicTitle = actualTitle || workingDescription || `Untitled — Rank ${rank}`;

    let slug = slugify(publicTitle);
    if (!slug) slug = `artwork-${rank}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${rank}`;
    }
    seenSlugs.set(slug, rank);

    const price = parsePrice(row['Target Price (R)']);
    if (price.invalid) report.invalidPrices.push({ rank, raw: row['Target Price (R)'] });

    const width = parseDimension(row['Width (cm)']);
    const height = parseDimension(row['Height (cm)']);
    if (width.invalid) report.invalidDimensions.push({ rank, field: 'Width (cm)', raw: row['Width (cm)'] });
    if (height.invalid) report.invalidDimensions.push({ rank, field: 'Height (cm)', raw: row['Height (cm)'] });
    // Dimensions are only displayed as a pair — if only one side is present, treat both as absent
    // rather than publishing a partial measurement.
    const hasBothDimensions = width.value !== null && height.value !== null;

    const imageFile = imagesByRank.get(rank);
    if (!imageFile) {
      report.missingImages.push(rank);
    } else {
      usedImageFiles.add(imageFile);
    }

    const destFilename = imageFile
      ? `${String(rank).padStart(2, '0')}-${slug}${path.extname(imageFile).toLowerCase()}`
      : null;

    records.push({
      rank: Number(rank),
      slug,
      publicTitle,
      workingDescription,
      category: cleanText(row['Category']),
      widthCm: hasBothDimensions ? width.value : null,
      heightCm: hasBothDimensions ? height.value : null,
      medium: cleanText(row['Medium']),
      surface: cleanText(row['Surface']),
      framed: parseFramed(row['Framed?']),
      priceCents: price.cents,
      imageSourceFile: imageFile || null,
      imagePublicPath: destFilename ? `/images/artworks/originals/${destFilename}` : null,
      imageWidthPx: null,
      imageHeightPx: null,
      // Internal-only fields: never rendered on any public page or public API response.
      internal: {
        launchPriority: cleanText(row['Launch Priority']),
        sellabilityTier: cleanText(row['Sellability Tier']),
        sellingNote: cleanText(row['Why / Selling Note']),
        bobShopStatus: cleanText(row['Bob Shop Status']),
        facebookStatus: cleanText(row['Facebook Status']),
        notes: cleanText(row['Notes']),
      },
    });
  }

  for (let r = 1; r <= EXPECTED_RANKS; r++) {
    if (!seenRanks.has(r)) report.missingRanks.push(r);
  }
  for (const [rank, file] of imagesByRank.entries()) {
    if (!usedImageFiles.has(file) && !records.some((rec) => rec.rank === rank)) {
      report.imagesWithoutRows.push(file);
    }
  }

  // Copy originals byte-for-byte (no recompression) into the public web asset
  // folder, and read each image's real pixel dimensions (used by the gallery
  // grid to preserve aspect ratio and avoid layout shift — never guessed).
  fs.mkdirSync(IMAGE_DEST_DIR, { recursive: true });
  for (const rec of records) {
    if (!rec.imageSourceFile) continue;
    const src = path.join(IMAGES_DIR, rec.imageSourceFile);
    const destFilename = path.basename(rec.imagePublicPath);
    const dest = path.join(IMAGE_DEST_DIR, destFilename);
    fs.copyFileSync(src, dest);
    const metadata = await sharp(src).metadata();
    rec.imageWidthPx = metadata.width ?? null;
    rec.imageHeightPx = metadata.height ?? null;
  }

  report.imported = records.length;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'artworks.seed.json'), JSON.stringify(records, null, 2));

  const hasBlockingIssues =
    report.missingRanks.length > 0 ||
    report.duplicateRanks.length > 0 ||
    report.duplicateImagePrefixes.length > 0 ||
    report.missingImages.length > 0;

  if (hasBlockingIssues) {
    report.warnings.push(
      'Blocking issues found (missing ranks, duplicate ranks, missing images, or duplicate image prefixes). Review before relying on this import.'
    );
  }

  fs.writeFileSync(path.join(OUT_DIR, 'import-report.json'), JSON.stringify(report, null, 2));

  console.log('--- Art by Des Green: catalogue import ---');
  console.log(`Rows read from spreadsheet: ${report.rowsRead}`);
  console.log(`Artworks parsed: ${report.imported} / ${EXPECTED_RANKS} expected ranks`);
  console.log(`Missing ranks: ${report.missingRanks.length ? report.missingRanks.join(', ') : 'none'}`);
  console.log(`Duplicate ranks: ${report.duplicateRanks.length ? report.duplicateRanks.join(', ') : 'none'}`);
  console.log(`Missing images: ${report.missingImages.length ? report.missingImages.join(', ') : 'none'}`);
  console.log(
    `Duplicate image prefixes: ${report.duplicateImagePrefixes.length ? JSON.stringify(report.duplicateImagePrefixes) : 'none'}`
  );
  console.log(
    `Duplicate image content: ${report.duplicateImageContent.length ? JSON.stringify(report.duplicateImageContent) : 'none'}`
  );
  console.log(`Images with no matching spreadsheet row: ${report.imagesWithoutRows.length ? report.imagesWithoutRows.join(', ') : 'none'}`);
  console.log(`Invalid prices (excluded, not zeroed): ${report.invalidPrices.length ? JSON.stringify(report.invalidPrices) : 'none'}`);
  console.log(`Invalid dimensions (excluded, not guessed): ${report.invalidDimensions.length ? JSON.stringify(report.invalidDimensions) : 'none'}`);
  console.log(`Report written to ${path.relative(ROOT, path.join(OUT_DIR, 'import-report.json'))}`);
  console.log(`Seed data written to ${path.relative(ROOT, path.join(OUT_DIR, 'artworks.seed.json'))}`);
  console.log(`Images copied to ${path.relative(ROOT, IMAGE_DEST_DIR)}`);

  if (APPLY) {
    await upsertToDatabase(records, report);
  } else {
    console.log('\nDry run only (no --apply flag) — database was not touched.');
  }

  if (hasBlockingIssues) {
    console.error('\nImport finished with blocking issues — see warnings above.');
    process.exitCode = 1;
  }
}

async function upsertToDatabase(records, report) {
  if (!process.env.DATABASE_URL) {
    console.warn('\n--apply was passed but DATABASE_URL is not set — skipping database write.');
    return;
  }
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');

    // Resolve (and create) categories first, keyed by exact spreadsheet name.
    const categoryIds = new Map();
    const categoryNames = [...new Set(records.map((r) => r.category).filter(Boolean))];
    for (const name of categoryNames) {
      const slug = slugify(name);
      const res = await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET name = excluded.name
         RETURNING id`,
        [name, slug]
      );
      categoryIds.set(name, res.rows[0].id);
    }

    for (const rec of records) {
      const categoryId = rec.category ? categoryIds.get(rec.category) : null;
      const existing = await client.query(
        'SELECT id, admin_edited FROM artworks WHERE rank = $1',
        [rec.rank]
      );
      if (existing.rowCount > 0) {
        const row = existing.rows[0];
        const forced = forceAll || forceRanks.has(rec.rank);
        if (row.admin_edited && !forced) {
          report.skippedAdminEdited += 1;
          continue;
        }
        await client.query(
          `UPDATE artworks SET
            slug = $1, public_title = $2, working_description = $3, category_id = $4,
            width_cm = $5, height_cm = $6, medium = $7, surface = $8, framed = $9,
            price_cents = $10, primary_image_path = $11,
            primary_image_width = $12, primary_image_height = $13,
            internal_launch_priority = $14, internal_sellability_tier = $15,
            internal_selling_note = $16, internal_notes = $17,
            updated_at = now()
          WHERE id = $18`,
          [
            rec.slug,
            rec.publicTitle,
            rec.workingDescription,
            categoryId,
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
            row.id,
          ]
        );
        report.updated += 1;
      } else {
        await client.query(
          `INSERT INTO artworks (
            rank, slug, public_title, working_description, category_id,
            width_cm, height_cm, medium, surface, framed, price_cents,
            primary_image_path, primary_image_width, primary_image_height,
            internal_launch_priority, internal_sellability_tier,
            internal_selling_note, internal_notes, availability_status, publishing_status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'draft','draft')`,
          [
            rec.rank,
            rec.slug,
            rec.publicTitle,
            rec.workingDescription,
            categoryId,
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
          ]
        );
      }
    }
    await client.query('COMMIT');
    console.log(`\nDatabase updated. Skipped ${report.skippedAdminEdited} row(s) already edited by the admin (use --force to override).`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('\nImport failed:', err.message);
  process.exitCode = 1;
});
