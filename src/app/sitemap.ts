import type { MetadataRoute } from 'next';
import { listPublishedArtworks } from '@/lib/data/artworks';

// Must stay dynamic — artwork URLs change as pieces are published/sold, and a
// statically frozen sitemap would silently miss new artworks forever.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/gallery',
    '/available-works',
    '/sold-work',
    '/meet-the-artist',
    '/commissions',
    '/contact',
    '/legal/privacy-policy',
    '/legal/terms',
    '/legal/shipping-and-collection',
    '/legal/returns-and-refunds',
    '/legal/copyright',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  let artworkRoutes: MetadataRoute.Sitemap = [];
  try {
    const artworks = await listPublishedArtworks();
    artworkRoutes = artworks.map((a) => ({
      url: `${siteUrl}/artwork/${a.slug}`,
      lastModified: new Date(a.updatedAt),
    }));
  } catch {
    // Database not configured yet — sitemap still returns the static routes.
  }

  return [...staticRoutes, ...artworkRoutes];
}
