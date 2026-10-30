import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { isPayfastLive } from '@/lib/payfast-live';
import { SpecsList } from './specs-list';
import { TrustFacts } from './trust-facts';
import { AvailabilityBadge } from './availability-badge';
import { LinkButton } from '@/components/ui/button';
import { WhatsAppLink } from '@/components/whatsapp-link';
import { artworkWhatsappMessage, whatsappLink } from '@/lib/whatsapp';

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
    <div className={compact ? 'grid gap-6' : 'grid gap-5 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-16'}>
      <div className="relative">
        <div className={`relative w-full overflow-hidden bg-parchment ${compact ? '' : 'p-[2.5%] sm:p-[6%]'}`}>
          {artwork.primaryImagePath && (
            <Image
              src={artwork.primaryImagePath}
              alt={artwork.altText || artwork.publicTitle}
              width={artwork.primaryImageWidth ?? 1200}
              height={artwork.primaryImageHeight ?? 1400}
              sizes={compact ? '90vw' : '(min-width: 1024px) 55vw, 92vw'}
              className={`mx-auto h-auto object-contain ${compact ? 'w-full' : 'max-h-[50vh] w-auto max-w-full drop-shadow sm:max-h-[78vh]-[0_14px_26px_rgba(42,36,30,0.25)]'}`}
              priority
            />
          )}
        </div>
        <div className="absolute left-4 top-4">
          <AvailabilityBadge status={artwork.availabilityStatus} isNew={artwork.isNew} />
        </div>
      </div>

      <div className={compact ? '' : 'lg:sticky lg:top-28 lg:pt-4'}>
        {artwork.category && (
          <p className="text-[0.7rem] tracking-[0.28em] text-clay-dark">{artwork.category.name.toUpperCase()}</p>
        )}
        <h1 className={`mt-2 font-serif leading-tight sm:mt-3 text-charcoal ${compact ? 'text-2xl' : 'text-3xl sm:text-[2.6rem]'}`}>
          {artwork.publicTitle}
        </h1>

        {isPurchasable && artwork.priceCents !== null && (
          <p className="mt-2 text-2xl text-clay-dark sm:mt-4">{formatZAR(artwork.priceCents)}</p>
        )}
        {artwork.widthCm && artwork.heightCm && (
          <p className="mt-2 text-sm tracking-wide text-charcoal-soft">
            {artwork.widthCm} × {artwork.heightCm} cm{artwork.medium ? ` · ${artwork.medium}` : ''}
            {artwork.surface ? ` on ${artwork.surface.toLowerCase()}` : ''}
          </p>
        )}
        {message && <p className="mt-4 text-sm text-charcoal-soft">{message}</p>}

        <div className="mt-5 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
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

        <WhatsAppLink
          href={whatsappLink(
            artworkWhatsappMessage(artwork.publicTitle, artwork.slug, artwork.availabilityStatus === 'sold')
          )}
          label={
            artwork.availabilityStatus === 'sold'
              ? 'Ask about similar work on WhatsApp'
              : 'Ask about this painting on WhatsApp'
          }
          placement="artwork"
          artworkTitle={artwork.publicTitle}
          className="mt-3 inline-flex items-center gap-2.5 sm:mt-4 border border-[#1f7a4d]/35 bg-cream px-5 py-2.5 text-sm tracking-wide text-[#1f6b45] transition-colors hover:border-[#1f7a4d] hover:bg-[#1f7a4d] hover:text-cream"
        />

        {isPurchasable && (
          <p className="mt-4 text-xs text-charcoal-soft">
            {payfastLive
              ? 'Secure payment through PayFast. No card details are stored on this website.'
              : 'Payment will be arranged securely once your shipping or collection details have been confirmed.'}
          </p>
        )}

        <div className="mt-8 border-t border-border-soft pt-6">
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

        {!compact && (
          <Link href="/gallery" className="mt-8 inline-block text-sm text-clay-dark underline underline-offset-4">
            ← Back to Gallery
          </Link>
        )}
      </div>
    </div>
  );
}
