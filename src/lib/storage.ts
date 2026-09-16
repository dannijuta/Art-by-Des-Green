import 'server-only';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ARTWORK_BUCKET = 'artwork-images';
const COMMISSION_BUCKET = 'commission-references';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

// Artwork images are served directly (unoptimized — see components that
// render primaryImagePath) rather than resized per-request by Vercel's
// metered image optimizer, so every upload is resized once, here, to a
// sensible max dimension instead of storing a raw multi-MB phone photo.
const ARTWORK_IMAGE_MAX_DIMENSION = 1920;
const ARTWORK_IMAGE_QUALITY = 82;

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // Service-role key: server-only, never sent to the browser. Used for admin
  // uploads and storing commission reference images.
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function sanitizeFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${crypto.randomUUID()}.${ext}`;
}

async function uploadToBucket(
  bucket: string,
  file: File,
  options?: { resizeForWeb?: boolean }
): Promise<{ path: string; publicUrl: string; width: number | null; height: number | null } | null> {
  const client = getServiceClient();
  if (!client) return null;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG or WebP images are allowed.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large (maximum 15MB).');
  }

  let filename = sanitizeFilename(file.name);
  let buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;

  if (options?.resizeForWeb) {
    buffer = await sharp(buffer)
      .rotate() // apply EXIF orientation before stripping metadata
      .resize({
        width: ARTWORK_IMAGE_MAX_DIMENSION,
        height: ARTWORK_IMAGE_MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: ARTWORK_IMAGE_QUALITY })
      .toBuffer();
    filename = filename.replace(/\.[a-z0-9]+$/, '.jpg');
    contentType = 'image/jpeg';
  }

  // Dimensions of whatever buffer is actually being stored (post-resize, if
  // applicable) — must match what's uploaded, not the original file.
  const metadata = await sharp(buffer).metadata();

  const { error } = await client.storage.from(bucket).upload(filename, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = client.storage.from(bucket).getPublicUrl(filename);
  return { path: filename, publicUrl: data.publicUrl, width: metadata.width ?? null, height: metadata.height ?? null };
}

export function uploadArtworkImage(file: File) {
  return uploadToBucket(ARTWORK_BUCKET, file, { resizeForWeb: true });
}

export function uploadCommissionReference(file: File) {
  return uploadToBucket(COMMISSION_BUCKET, file);
}
