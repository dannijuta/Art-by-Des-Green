'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { artworkThumbPath } from '@/lib/image-paths';
import { trackMetaEvent } from '@/lib/meta-pixel';
import { AvailabilityBadge } from './availability-badge';

export function ArtworkCard({
  artwork,
  priority = false,
  onOpen,
}: {
  artwork: Artwork;
  priority?: boolean;
  onOpen?: (e: React.MouseEvent) => void;
}) {

  // Every click on an artwork thumbnail — whether it opens the lightbox
  // (gallery/available-works) or navigates straight to the artwork page
  // (home page, related works) — is a genuine "clicked on this painting"
  // signal. TrackViewContent (on the artwork detail page itself) only fires
  // for the subset of clicks that result in a real page load, so without
  // this a thumbnail opened in the lightbox is invisible to Meta entirely.
  function handleClick(e: React.MouseEvent) {
    trackMetaEvent('ArtworkClick', {
      content_ids: [artwork.id],
      content_type: 'product',
      content_name: artwork.publicTitle,
      content_category: artwork.category?.name ?? undefined,
    });
    onOpen?.(e);
  }

  return (
    <Link
      href={`/artwork/${artwork.slug}`}
      onClick={handleClick}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-parchment/70 transition-colors duration-500 group-hover:bg-parchment">
        {artwork.primaryImagePath && (
          <div className="absolute inset-[7%]">
            <Image
              src={artworkThumbPath(artwork.primaryImagePath)}
              alt={artwork.altText || artwork.publicTitle}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
              className="object-contain drop-shadow-[0_6px_14px_rgba(42,36,30,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              priority={priority}
            />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <AvailabilityBadge status={artwork.availabilityStatus} isNew={artwork.isNew} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-serif text-[1.05rem] text-charcoal transition-colors group-hover:text-clay-dark">
            {artwork.publicTitle}
          </p>
          {artwork.widthCm && artwork.heightCm && (
            <p className="mt-1 text-xs tracking-wide text-charcoal-soft">
              {artwork.widthCm} × {artwork.heightCm} cm
            </p>
          )}
        </div>
        {artwork.priceCents !== null && artwork.availabilityStatus === 'available' && (
          <p className="whitespace-nowrap text-sm text-clay-dark">{formatZAR(artwork.priceCents)}</p>
        )}
      </div>
    </Link>
  );
}
