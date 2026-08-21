import 'server-only';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const ARTWORK_BUCKET = 'artwork-images';
const COMMISSION_BUCKET = 'commission-references';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

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

async function uploadToBucket(bucket: string, file: File): Promise<{ path: string; publicUrl: string } | null> {
  const client = getServiceClient();
  if (!client) return null;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG or WebP images are allowed.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large (maximum 15MB).');
  }

  const filename = sanitizeFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(bucket).upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = client.storage.from(bucket).getPublicUrl(filename);
  return { path: filename, publicUrl: data.publicUrl };
}

export function uploadArtworkImage(file: File) {
  return uploadToBucket(ARTWORK_BUCKET, file);
}

export function uploadCommissionReference(file: File) {
  return uploadToBucket(COMMISSION_BUCKET, file);
}
