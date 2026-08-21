import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedArtworkBySlug, getRelatedArtworks } from '@/lib/data/artworks';
import { getShippingSettings } from '@/lib/data/settings';
import { ArtworkDetail } from '@/components/artwork/artwork-detail';
import { ArtworkCard } from '@/components/artwork/artwork-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { resolveShippingMethod, shippingMethodLabel } from '@/lib/shipping';

export async function generateMetadata(props: PageProps<'/artwork/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const artwork = await getPublishedArtworkBySlug(slug);
  if (!artwork) return {};

  const description = artwork.publicDescription
    ? artwork.publicDescription.slice(0, 155)
    : `Original oil painting by Des Green${artwork.category ? ` — ${artwork.category.name}` : ''}.`;

  return {
    title: artwork.publicTitle,
    description,
    alternates: { canonical: `/artwork/${artwork.slug}` },
    openGraph: {
      title: artwork.publicTitle,
      description,
      images: artwork.primaryImagePath ? [artwork.primaryImagePath] : undefined,
    },
  };
}

export default async function ArtworkPage(props: PageProps<'/artwork/[slug]'>) {
  const { slug } = await props.params;
  const artwork = await getPublishedArtworkBySlug(slug);
  if (!artwork) notFound();

  const [related, shippingSettings] = await Promise.all([
    getRelatedArtworks(artwork, 4),
    getShippingSettings(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const artworkUrl = `${siteUrl}/artwork/${artwork.slug}`;
  const isPurchasable = artwork.availabilityStatus === 'available' && artwork.priceCents !== null;
  const shippingMethod = resolveShippingMethod(artwork, shippingSettings);

  const visualArtworkJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.publicTitle,
    image: artwork.primaryImagePath ? `${siteUrl}${artwork.primaryImagePath}` : undefined,
    artform: 'Painting',
    artMedium: artwork.medium ?? undefined,
    artworkSurface: artwork.surface ?? undefined,
    width: artwork.widthCm ? { '@type': 'QuantitativeValue', value: artwork.widthCm, unitCode: 'CMT' } : undefined,
    height: artwork.heightCm ? { '@type': 'QuantitativeValue', value: artwork.heightCm, unitCode: 'CMT' } : undefined,
    creator: { '@type': 'Person', name: 'Des Green' },
    url: artworkUrl,
    ...(isPurchasable && artwork.priceCents !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: (artwork.priceCents / 100).toFixed(2),
            priceCurrency: 'ZAR',
            availability: 'https://schema.org/InStock',
            url: artworkUrl,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Gallery', item: `${siteUrl}/gallery` },
      { '@type': 'ListItem', position: 2, name: artwork.publicTitle, item: artworkUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visualArtworkJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ArtworkDetail artwork={artwork} />

      {isPurchasable && (
        <p className="mt-4 max-w-lg text-sm text-charcoal-soft">{shippingMethodLabel(shippingMethod, shippingSettings)}</p>
      )}

      {related.length > 0 && (
        <section className="mt-20 border-t border-border-soft pt-12">
          <SectionHeading title="Related Works" />
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((r) => (
              <ArtworkCard key={r.id} artwork={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
