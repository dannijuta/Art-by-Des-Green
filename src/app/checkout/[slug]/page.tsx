import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedArtworkBySlug } from '@/lib/data/artworks';
import { getShippingSettings } from '@/lib/data/settings';
import { resolveShippingMethod, shippingMethodLabel } from '@/lib/shipping';
import { formatZAR } from '@/lib/money';
import { CheckoutForm } from '@/components/forms/checkout-form';
import { SectionHeading } from '@/components/ui/section-heading';
import { isPayfastLive } from '@/lib/payfast-live';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutStartPage(props: PageProps<'/checkout/[slug]'>) {
  const { slug } = await props.params;
  const artwork = await getPublishedArtworkBySlug(slug);

  if (!artwork || artwork.priceCents === null) notFound();
  if (artwork.availabilityStatus !== 'available') {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
        <SectionHeading as="h1" title="No longer available" />
        <p className="mt-4 text-charcoal-soft">
          {artwork.publicTitle} is no longer available for purchase — it may have just sold or been reserved.
        </p>
        <Link href="/available-works" className="mt-6 inline-block text-clay-dark underline underline-offset-4">
          Browse other available works
        </Link>
      </div>
    );
  }

  const shippingSettings = await getShippingSettings();
  const method = resolveShippingMethod(artwork, shippingSettings);
  const shippingLabel = shippingMethodLabel(method, shippingSettings);
  const payfastLive = isPayfastLive();

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <SectionHeading
        as="h1"
        eyebrow={payfastLive ? 'Secure Checkout' : 'Purchase Request'}
        title={payfastLive ? 'Acquire This Artwork' : 'Request to Purchase'}
      />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <div className="relative w-full overflow-hidden bg-parchment">
            {artwork.primaryImagePath && (
              <Image
                src={artwork.primaryImagePath}
                alt={artwork.altText || artwork.publicTitle}
                width={artwork.primaryImageWidth ?? 900}
                height={artwork.primaryImageHeight ?? 1100}
                sizes="(min-width: 1024px) 35vw, 90vw"
                className="h-auto w-full object-contain"
              />
            )}
          </div>
          <p className="mt-4 font-serif text-xl text-charcoal">{artwork.publicTitle}</p>
          {artwork.widthCm && artwork.heightCm && (
            <p className="text-sm text-charcoal-soft">
              {artwork.widthCm} × {artwork.heightCm} cm
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-border-soft pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-soft">Artwork price</span>
              <span className="text-charcoal">{formatZAR(artwork.priceCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-soft">Shipping</span>
              <span className="text-charcoal">
                {method === 'quote_required'
                  ? 'To be confirmed'
                  : method === 'flat_rate' && shippingSettings.flatRateCents
                    ? formatZAR(shippingSettings.flatRateCents)
                    : 'Included'}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-charcoal-soft">{shippingLabel}</p>
        </div>

        <div>
          <CheckoutForm artworkId={artwork.id} shippingMethod={method} payfastLive={payfastLive} />
        </div>
      </div>
    </div>
  );
}
