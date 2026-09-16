const LOCAL_ARTWORK_PREFIX = '/images/artworks/originals/';
const LOCAL_THUMB_PREFIX = '/images/artworks/thumbs/';

/**
 * Grid/card views only need a small preview. Locally-hosted originals have a
 * pre-generated thumbnail (scripts/dev/generate-artwork-thumbs.mjs) that
 * keeps gallery pages light without relying on Vercel's metered image
 * optimizer. Admin-uploaded (Supabase-hosted) images have no separate thumb
 * — there are few enough of those that serving the full image is fine.
 */
export function artworkThumbPath(primaryImagePath: string): string {
  if (primaryImagePath.startsWith(LOCAL_ARTWORK_PREFIX)) {
    return LOCAL_THUMB_PREFIX + primaryImagePath.slice(LOCAL_ARTWORK_PREFIX.length);
  }
  return primaryImagePath;
}
