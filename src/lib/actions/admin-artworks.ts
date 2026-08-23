'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { artworkAdminSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';
import { uploadArtworkImage } from '@/lib/storage';
import { randToCents } from '@/lib/money';

export interface ArtworkFormState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let suffix = 2;
  for (;;) {
    const { rows } = await query<{ id: string }>('select id from artworks where slug = $1', [slug]);
    if (rows.length === 0 || (excludeId && rows[0].id === excludeId)) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function saveArtwork(id: string | null, formData: FormData): Promise<ArtworkFormState> {
  const session = await requireAdmin();

  const parsed = artworkAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  const d = parsed.data;
  const widthCm = parseNumber(d.widthCm);
  const heightCm = parseNumber(d.heightCm);
  const priceRand = parseNumber(d.priceRand);
  const priceCents = priceRand !== null ? randToCents(priceRand) : null;
  const framed = d.framed === 'yes' ? true : d.framed === 'no' ? false : null;
  const categoryId = d.categoryId ? Number(d.categoryId) : null;
  const isFeatured = d.isFeatured === 'on' || d.isFeatured === true;
  const isHero = d.isHero === 'on' || d.isHero === true;
  const shippingOverride = d.shippingMethodOverride || null;

  let imagePath: string | null = null;
  let imageWidth: number | null = null;
  let imageHeight: number | null = null;
  const imageFile = formData.get('image');
  const hasImageFile = imageFile instanceof File && imageFile.size > 0;

  if (!id && !hasImageFile) {
    return {
      status: 'error',
      message: 'Please choose a photo before saving a new artwork.',
      fieldErrors: { image: 'Please choose a photo for this artwork.' },
    };
  }

  if (hasImageFile) {
    try {
      const uploaded = await uploadArtworkImage(imageFile);
      if (uploaded) {
        imagePath = uploaded.publicUrl;
        const sharpModule = await import('sharp');
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const metadata = await sharpModule.default(buffer).metadata();
        imageWidth = metadata.width ?? null;
        imageHeight = metadata.height ?? null;
      } else {
        return {
          status: 'error',
          message: 'Image storage is not configured yet (set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
        };
      }
    } catch (err) {
      return { status: 'error', message: err instanceof Error ? err.message : 'Image upload failed.' };
    }
  }

  if (id) {
    const slug = await uniqueSlug(slugify(d.publicTitle), id);
    await query(
      `update artworks set
        public_title = $1, working_description = $2, public_description = $3, category_id = $4,
        width_cm = $5, height_cm = $6, medium = $7, surface = $8, framed = $9, price_cents = $10,
        availability_status = $11, publishing_status = $12, is_featured = $13, is_hero = $14,
        shipping_method_override = $15, alt_text = $16, slug = $17, admin_edited = true,
        primary_image_path = coalesce($18, primary_image_path),
        primary_image_width = coalesce($19, primary_image_width),
        primary_image_height = coalesce($20, primary_image_height)
      where id = $21`,
      [
        d.publicTitle,
        d.workingDescription || null,
        d.publicDescription || null,
        categoryId,
        widthCm,
        heightCm,
        d.medium || null,
        d.surface || null,
        framed,
        priceCents,
        d.availabilityStatus,
        d.publishingStatus,
        isFeatured,
        isHero,
        shippingOverride,
        d.altText || null,
        slug,
        imagePath,
        imageWidth,
        imageHeight,
        id,
      ]
    );
    await query('insert into audit_log (actor_email, action, entity_type, entity_id) values ($1,$2,$3,$4)', [
      session.email,
      'update',
      'artwork',
      id,
    ]);
    return { status: 'idle' };
  }

  const nextRank = await query<{ max: number | null }>('select max(rank) as max from artworks');
  const rank = (nextRank.rows[0]?.max ?? 0) + 1;
  const slug = await uniqueSlug(slugify(d.publicTitle));

  const inserted = await query<{ id: string }>(
    `insert into artworks (
      rank, slug, public_title, working_description, public_description, category_id,
      width_cm, height_cm, medium, surface, framed, price_cents,
      availability_status, publishing_status, is_featured, is_hero, shipping_method_override, alt_text,
      primary_image_path, primary_image_width, primary_image_height, admin_edited
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,true)
    returning id`,
    [
      rank,
      slug,
      d.publicTitle,
      d.workingDescription || null,
      d.publicDescription || null,
      categoryId,
      widthCm,
      heightCm,
      d.medium || null,
      d.surface || null,
      framed,
      priceCents,
      d.availabilityStatus,
      d.publishingStatus,
      isFeatured,
      isHero,
      shippingOverride,
      d.altText || null,
      imagePath,
      imageWidth,
      imageHeight,
    ]
  );
  await query('insert into audit_log (actor_email, action, entity_type, entity_id) values ($1,$2,$3,$4)', [
    session.email,
    'create',
    'artwork',
    inserted.rows[0].id,
  ]);

  redirect(`/admin/artworks/${inserted.rows[0].id}/edit`);
}

export async function createArtworkAction(_prev: ArtworkFormState, formData: FormData) {
  return saveArtwork(null, formData);
}

export async function updateArtworkAction(id: string, _prev: ArtworkFormState, formData: FormData) {
  return saveArtwork(id, formData);
}

export async function archiveArtworkAction(id: string) {
  const session = await requireAdmin();
  await query(`update artworks set publishing_status = 'archived' where id = $1`, [id]);
  await query('insert into audit_log (actor_email, action, entity_type, entity_id) values ($1,$2,$3,$4)', [
    session.email,
    'archive',
    'artwork',
    id,
  ]);
}

export async function deleteArtworkAction(id: string) {
  await requireAdmin();
  await query('delete from artworks where id = $1', [id]);
  redirect('/admin/artworks');
}
