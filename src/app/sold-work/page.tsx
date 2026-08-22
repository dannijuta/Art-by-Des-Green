import type { Metadata } from 'next';
import { listSoldWorks, hasSoldWorks } from '@/lib/data/artworks';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { SectionHeading } from '@/components/ui/section-heading';

export async function generateMetadata(): Promise<Metadata> {
  const hasAny = await hasSoldWorks();
  return {
    title: 'Sold Work',
    description: 'A record of original paintings by Des Green that have found new homes.',
    // Nothing to show yet keeps this page out of search results rather than
    // implying Des has never sold a painting.
    robots: hasAny ? undefined : { index: false, follow: true },
  };
}

export default async function SoldWorkPage() {
  const artworks = await listSoldWorks();

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <SectionHeading as="h1" eyebrow="Found New Homes" title="Sold Work" />
      <p className="mt-4 max-w-2xl text-base text-charcoal-soft">
        A record of originals that have already found their place. Each one is unique and cannot be purchased again.
      </p>

      <div className="mt-10">
        {artworks.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-charcoal-soft">
              No sold works recorded yet — original paintings are added here once they&apos;ve found a home.
            </p>
          </div>
        ) : (
          <GalleryGrid artworks={artworks} />
        )}
      </div>
    </div>
  );
}
