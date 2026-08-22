import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/home/hero';
import { ArtworkCard } from '@/components/artwork/artwork-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { getHeroArtwork, listFeaturedArtworks, listCategories } from '@/lib/data/artworks';
import { getHomepageCopy, getArtistProfile } from '@/lib/data/settings';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default async function HomePage() {
  const [hero, featured, categories, copy, artist] = await Promise.all([
    getHeroArtwork(),
    listFeaturedArtworks(4),
    listCategories(),
    getHomepageCopy(),
    getArtistProfile(),
  ]);

  return (
    <>
      <Hero hero={hero} copy={copy} />

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <SectionHeading
            eyebrow="Featured Originals"
            title="Selected Works"
            action={
              <Link href="/available-works" className="text-sm text-clay-dark underline underline-offset-4">
                View all available works →
              </Link>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((artwork, i) => (
              <ArtworkCard key={artwork.id} artwork={artwork} priority={i === 0} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="border-y border-border-soft bg-parchment">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <SectionHeading eyebrow="Explore" title="Stories in Colour" />
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/gallery?category=${category.slug}`}
                  className="border border-border px-4 py-2 text-sm text-charcoal transition-colors hover:border-clay hover:text-clay-dark"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-parchment">
            {artist.studioImagePath ? (
              <Image
                src={artist.studioImagePath}
                alt={artist.studioImageAlt || 'Des Green working in her studio.'}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-border text-sm text-charcoal-soft">
                Studio photograph coming soon
              </div>
            )}
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] text-clay-dark">ABOUT THE ARTIST</p>
            <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">{artist.name}</h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              {artist.professionalDescription} · {artist.basedIn}
            </p>
            {artist.introLine && (
              <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal-soft">{artist.introLine}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/meet-the-artist"
                className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream transition-colors hover:bg-clay-dark"
              >
                Meet Des Green
              </Link>
              {artist.commissionsOpen && (
                <Link
                  href={copy.commissionsCtaHref}
                  className="inline-flex items-center justify-center border border-charcoal px-6 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
                >
                  {copy.commissionsCtaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border-soft bg-charcoal">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h2 className="font-serif text-3xl text-cream sm:text-4xl">Private Enquiries</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/80">
            Have a question about a piece, its availability, or shipping? Reach out directly — Des replies to every
            enquiry personally.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center bg-cream px-6 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-cream/90"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
