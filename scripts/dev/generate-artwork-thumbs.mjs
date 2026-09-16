import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SRC_DIR = path.join(ROOT, 'public', 'images', 'artworks', 'originals');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'artworks', 'thumbs');

const THUMB_MAX_DIMENSION = 640;
const THUMB_QUALITY = 78;

await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

let count = 0;
for (const file of files) {
  const src = path.join(SRC_DIR, file);
  const outName = file.replace(/\.[a-z0-9]+$/i, '.jpg');
  const out = path.join(OUT_DIR, outName);

  await sharp(src)
    .resize({ width: THUMB_MAX_DIMENSION, height: THUMB_MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: THUMB_QUALITY })
    .toFile(out);

  count++;
}

console.log(`Generated ${count} thumbnails in ${OUT_DIR}`);
