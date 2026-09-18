import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { artworkThumbPath } from '@/lib/image-paths';
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
  const width = artwork.primaryImageWidth ?? 1000;
  const height = artwork.primaryImageHeight ?? 1200;

  return (
    <Link
      href={`/artwork/${artwork.slug}`}
      onClick={onOpen}
      className="group mb-6 block break-inside-avoid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
    >
      <div className="relative overflow-hidden bg-parchment">
        {artwork.primaryImagePath && (
          <Image
            src={artworkThumbPath(artwork.primaryImagePath)}
            alt={artwork.altText || artwork.publicTitle}
            width={width}
            height={height}
            className="h-auto w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            priority={priority}
            unoptimized
          />
        )}
        <div className="absolute left-3 top-3">
          <AvailabilityBadge status={artwork.availabilityStatus} isNew={artwork.isNew} />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="p-4 text-cream">
            <p className="font-serif text-lg italic">{artwork.publicTitle}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="font-serif text-base text-charcoal">{artwork.publicTitle}</p>
          {artwork.widthCm && artwork.heightCm && (
            <p className="mt-0.5 text-xs text-charcoal-soft">
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
