import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { SpecsList } from './specs-list';
import { AvailabilityBadge } from './availability-badge';
import { LinkButton } from '@/components/ui/button';

export function ArtworkDetail({ artwork, compact = false }: { artwork: Artwork; compact?: boolean }) {
  const isPurchasable = artwork.availabilityStatus === 'available' && artwork.priceCents !== null;

  return (
    <div className={compact ? 'grid gap-6' : 'grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14'}>
      <div className="relative">
        <div className="relative w-full overflow-hidden bg-parchment">
          {artwork.primaryImagePath && (
            <Image
              src={artwork.primaryImagePath}
              alt={artwork.altText || artwork.publicTitle}
              width={artwork.primaryImageWidth ?? 1200}
              height={artwork.primaryImageHeight ?? 1400}
              sizes={compact ? '90vw' : '(min-width: 1024px) 55vw, 90vw'}
              className="h-auto w-full object-contain"
              quality={90}
              priority={compact}
            />
          )}
        </div>
        {artwork.availabilityStatus !== 'available' && (
          <div className="absolute left-4 top-4">
            <AvailabilityBadge status={artwork.availabilityStatus} />
          </div>
        )}
      </div>

      <div>
        {artwork.category && (
          <p className="text-xs tracking-[0.2em] text-clay-dark">{artwork.category.name.toUpperCase()}</p>
        )}
        <h1 className={`mt-2 font-serif text-charcoal ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
          {artwork.publicTitle}
        </h1>

        {isPurchasable && artwork.priceCents !== null && (
          <p className="mt-4 text-2xl text-clay-dark">{formatZAR(artwork.priceCents)}</p>
        )}
        {artwork.availabilityStatus === 'sold' && <p className="mt-4 text-sm text-charcoal-soft">This painting has been sold.</p>}
        {artwork.availabilityStatus === 'reserved' && (
          <p className="mt-4 text-sm text-charcoal-soft">This painting is currently reserved.</p>
        )}

        <div className="mt-6">
          <SpecsList artwork={artwork} />
        </div>

        {artwork.publicDescription && (
          <p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal-soft">{artwork.publicDescription}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          {isPurchasable ? (
            <LinkButton href={`/checkout/${artwork.slug}`} variant="primary">
              Acquire This Artwork
            </LinkButton>
          ) : null}
          <LinkButton
            href={`/contact?artworkId=${artwork.id}&artworkTitle=${encodeURIComponent(artwork.publicTitle)}`}
            variant={isPurchasable ? 'secondary' : 'primary'}
          >
            Private Enquiry
          </LinkButton>
        </div>

        {isPurchasable && (
          <p className="mt-4 text-xs text-charcoal-soft">
            Secure payment through PayFast. No card details are stored on this website.
          </p>
        )}

        {!compact && (
          <Link href="/gallery" className="mt-8 inline-block text-sm text-clay-dark underline underline-offset-4">
            ← Back to Gallery
          </Link>
        )}
      </div>
    </div>
  );
}
