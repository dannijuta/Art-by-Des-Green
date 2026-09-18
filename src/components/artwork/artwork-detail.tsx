import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { isPayfastLive } from '@/lib/payfast-live';
import { SpecsList } from './specs-list';
import { TrustFacts } from './trust-facts';
import { AvailabilityBadge } from './availability-badge';
import { LinkButton } from '@/components/ui/button';

function statusMessage(artwork: Artwork): string | null {
  switch (artwork.availabilityStatus) {
    case 'sold':
      return 'This painting has been sold.';
    case 'reserved':
      return 'This painting is currently reserved.';
    case 'private_collection':
      return 'This painting is part of a private collection and is not for sale.';
    case 'gallery_only':
      return artwork.priceCents === null ? 'Gallery Only — available on private enquiry.' : null;
    default:
      return null;
  }
}

export function ArtworkDetail({ artwork, compact = false }: { artwork: Artwork; compact?: boolean }) {
  const isPurchasable = artwork.availabilityStatus === 'available' && artwork.priceCents !== null;
  const message = statusMessage(artwork);
  const payfastLive = isPayfastLive();

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
              className="h-auto w-full object-contain"
              priority={compact}
              unoptimized
            />
          )}
        </div>
        <div className="absolute left-4 top-4">
          <AvailabilityBadge status={artwork.availabilityStatus} createdAt={artwork.createdAt} />
        </div>
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
        {message && <p className="mt-4 text-sm text-charcoal-soft">{message}</p>}

        <div className="mt-6">
          <SpecsList artwork={artwork} />
        </div>

        {(artwork.signed !== null || artwork.varnished !== null || artwork.certificateOfAuthenticity !== null) && (
          <div className="mt-4">
            <TrustFacts artwork={artwork} />
          </div>
        )}

        {artwork.publicDescription && (
          <p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal-soft">{artwork.publicDescription}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          {isPurchasable ? (
            <LinkButton href={`/checkout/${artwork.slug}`} variant="primary">
              {payfastLive ? 'Acquire This Artwork' : 'Request to Purchase'}
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
            {payfastLive
              ? 'Secure payment through PayFast. No card details are stored on this website.'
              : 'Payment will be arranged securely once your shipping or collection details have been confirmed.'}
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
