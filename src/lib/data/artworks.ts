import 'server-only';
import { query } from '@/lib/db';
import type { Artwork, ArtworkAdmin, ArtworkImage, Category } from '@/types/domain';

interface ArtworkRow {
  id: string;
  rank: number;
  slug: string;
  public_title: string;
  working_description: string | null;
  public_description: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  category_sort_order: number | null;
  width_cm: string | null;
  height_cm: string | null;
  medium: string | null;
  surface: string | null;
  framed: boolean | null;
  price_cents: number | null;
  availability_status: Artwork['availabilityStatus'];
  publishing_status: Artwork['publishingStatus'];
  is_featured: boolean;
  is_hero: boolean;
  display_order: number | null;
  primary_image_path: string | null;
  primary_image_width: number | null;
  primary_image_height: number | null;
  alt_text: string | null;
  shipping_method_override: Artwork['shippingMethodOverride'];
  admin_edited: boolean;
  internal_launch_priority: string | null;
  internal_sellability_tier: string | null;
  internal_selling_note: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

const BASE_SELECT = `
  select
    a.id, a.rank, a.slug, a.public_title, a.working_description, a.public_description,
    a.category_id, c.name as category_name, c.slug as category_slug, c.sort_order as category_sort_order,
    a.width_cm, a.height_cm, a.medium, a.surface, a.framed, a.price_cents,
    a.availability_status, a.publishing_status, a.is_featured, a.is_hero, a.display_order,
    a.primary_image_path, a.primary_image_width, a.primary_image_height, a.alt_text, a.shipping_method_override, a.admin_edited,
    a.internal_launch_priority, a.internal_sellability_tier, a.internal_selling_note, a.internal_notes,
    a.created_at, a.updated_at
  from artworks a
  left join categories c on c.id = a.category_id
`;

function mapRow(row: ArtworkRow, images: ArtworkImage[] = []): ArtworkAdmin {
  const category: Category | null = row.category_id
    ? {
        id: row.category_id,
        name: row.category_name!,
        slug: row.category_slug!,
        sortOrder: row.category_sort_order ?? 0,
      }
    : null;

  return {
    id: row.id,
    rank: row.rank,
    slug: row.slug,
    publicTitle: row.public_title,
    workingDescription: row.working_description,
    publicDescription: row.public_description,
    category,
    widthCm: row.width_cm !== null ? Number(row.width_cm) : null,
    heightCm: row.height_cm !== null ? Number(row.height_cm) : null,
    medium: row.medium,
    surface: row.surface,
    framed: row.framed,
    priceCents: row.price_cents,
    availabilityStatus: row.availability_status,
    publishingStatus: row.publishing_status,
    isFeatured: row.is_featured,
    isHero: row.is_hero,
    displayOrder: row.display_order,
    primaryImagePath: row.primary_image_path,
    primaryImageWidth: row.primary_image_width,
    primaryImageHeight: row.primary_image_height,
    altText: row.alt_text,
    shippingMethodOverride: row.shipping_method_override,
    additionalImages: images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    adminEdited: row.admin_edited,
    internalLaunchPriority: row.internal_launch_priority,
    internalSellabilityTier: row.internal_sellability_tier,
    internalSellingNote: row.internal_selling_note,
    internalNotes: row.internal_notes,
  };
}

/** Strips internal/business-only fields. Use this for every public-facing response. */
export function toPublicArtwork(artwork: ArtworkAdmin): Artwork {
  const {
    adminEdited: _adminEdited,
    internalLaunchPriority: _p,
    internalSellabilityTier: _t,
    internalSellingNote: _n,
    internalNotes: _notes,
    ...publicFields
  } = artwork;
  return publicFields;
}

export interface GalleryFilters {
  category?: string;
  availability?: 'available' | 'sold';
  search?: string;
}

export async function listPublishedArtworks(filters: GalleryFilters = {}): Promise<Artwork[]> {
  const clauses = [`a.publishing_status = 'published'`];
  const params: unknown[] = [];

  if (filters.category) {
    params.push(filters.category);
    clauses.push(`c.slug = $${params.length}`);
  }
  if (filters.availability === 'available') {
    clauses.push(`a.availability_status = 'available'`);
  } else if (filters.availability === 'sold') {
    clauses.push(`a.availability_status = 'sold'`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(a.public_title ILIKE $${params.length} OR a.working_description ILIKE $${params.length})`);
  }

  const sql = `${BASE_SELECT} where ${clauses.join(' and ')} order by coalesce(a.display_order, a.rank) asc`;
  const { rows } = await query<ArtworkRow>(sql, params);
  return rows.map((r) => toPublicArtwork(mapRow(r)));
}

export async function listAvailableWorks(): Promise<Artwork[]> {
  const sql = `${BASE_SELECT}
    where a.publishing_status = 'published'
      and a.availability_status = 'available'
      and a.price_cents is not null
    order by coalesce(a.display_order, a.rank) asc`;
  const { rows } = await query<ArtworkRow>(sql);
  return rows.map((r) => toPublicArtwork(mapRow(r)));
}

export async function listSoldWorks(): Promise<Artwork[]> {
  const sql = `${BASE_SELECT}
    where a.publishing_status = 'published' and a.availability_status = 'sold'
    order by a.updated_at desc`;
  const { rows } = await query<ArtworkRow>(sql);
  return rows.map((r) => toPublicArtwork(mapRow(r)));
}

export async function listFeaturedArtworks(limit = 4): Promise<Artwork[]> {
  const sql = `${BASE_SELECT}
    where a.publishing_status = 'published' and a.is_featured = true
    order by coalesce(a.display_order, a.rank) asc
    limit $1`;
  const { rows } = await query<ArtworkRow>(sql, [limit]);
  return rows.map((r) => toPublicArtwork(mapRow(r)));
}

export async function getHeroArtwork(): Promise<Artwork | null> {
  const sql = `${BASE_SELECT}
    where a.publishing_status = 'published' and a.is_hero = true
    order by coalesce(a.display_order, a.rank) asc
    limit 1`;
  const { rows } = await query<ArtworkRow>(sql);
  return rows[0] ? toPublicArtwork(mapRow(rows[0])) : null;
}

async function getImagesFor(artworkId: string): Promise<ArtworkImage[]> {
  const { rows } = await query<{
    id: string;
    image_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }>(
    'select id, image_path, alt_text, sort_order, is_primary from artwork_images where artwork_id = $1 order by sort_order asc',
    [artworkId]
  );
  return rows.map((r) => ({
    id: r.id,
    imagePath: r.image_path,
    altText: r.alt_text,
    sortOrder: r.sort_order,
    isPrimary: r.is_primary,
  }));
}

export async function getPublishedArtworkBySlug(slug: string): Promise<Artwork | null> {
  const sql = `${BASE_SELECT} where a.slug = $1 and a.publishing_status = 'published' limit 1`;
  const { rows } = await query<ArtworkRow>(sql, [slug]);
  if (!rows[0]) return null;
  const images = await getImagesFor(rows[0].id);
  return toPublicArtwork(mapRow(rows[0], images));
}

export async function getRelatedArtworks(artwork: Artwork, limit = 4): Promise<Artwork[]> {
  const params: unknown[] = [artwork.id];
  let categoryClause = '1=1';
  if (artwork.category) {
    params.push(artwork.category.id);
    categoryClause = `a.category_id = $${params.length}`;
  }
  params.push(limit);
  const sql = `${BASE_SELECT}
    where a.publishing_status = 'published' and a.id != $1 and ${categoryClause}
    order by coalesce(a.display_order, a.rank) asc
    limit $${params.length}`;
  const { rows } = await query<ArtworkRow>(sql, params);
  return rows.map((r) => toPublicArtwork(mapRow(r)));
}

export async function getAdjacentArtworks(rank: number): Promise<{ prev: Artwork | null; next: Artwork | null }> {
  const prevSql = `${BASE_SELECT} where a.publishing_status = 'published' and a.rank < $1 order by a.rank desc limit 1`;
  const nextSql = `${BASE_SELECT} where a.publishing_status = 'published' and a.rank > $1 order by a.rank asc limit 1`;
  const [prevRes, nextRes] = await Promise.all([
    query<ArtworkRow>(prevSql, [rank]),
    query<ArtworkRow>(nextSql, [rank]),
  ]);
  return {
    prev: prevRes.rows[0] ? toPublicArtwork(mapRow(prevRes.rows[0])) : null,
    next: nextRes.rows[0] ? toPublicArtwork(mapRow(nextRes.rows[0])) : null,
  };
}

export async function listCategories(): Promise<Category[]> {
  const { rows } = await query<{ id: number; name: string; slug: string; sort_order: number }>(
    `select distinct c.id, c.name, c.slug, c.sort_order
     from categories c
     join artworks a on a.category_id = c.id
     where a.publishing_status = 'published'
     order by c.sort_order asc, c.name asc`
  );
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, sortOrder: r.sort_order }));
}

// --- Admin queries -----------------------------------------------------

export async function listAllArtworksAdmin(): Promise<ArtworkAdmin[]> {
  const sql = `${BASE_SELECT} order by a.rank asc`;
  const { rows } = await query<ArtworkRow>(sql);
  return rows.map((r) => mapRow(r));
}

export async function getArtworkByIdAdmin(id: string): Promise<ArtworkAdmin | null> {
  const sql = `${BASE_SELECT} where a.id = $1 limit 1`;
  const { rows } = await query<ArtworkRow>(sql, [id]);
  if (!rows[0]) return null;
  const images = await getImagesFor(rows[0].id);
  return mapRow(rows[0], images);
}

export async function getDashboardCounts() {
  const { rows } = await query<{ availability_status: string; count: string }>(
    'select availability_status, count(*) from artworks group by availability_status'
  );
  const counts: Record<string, number> = {
    draft: 0,
    gallery_only: 0,
    available: 0,
    reserved: 0,
    sold: 0,
  };
  for (const row of rows) {
    counts[row.availability_status] = Number(row.count);
  }
  return counts;
}
