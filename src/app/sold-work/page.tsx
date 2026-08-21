import type { Metadata } from 'next';
import { listSoldWorks } from '@/lib/data/artworks';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Sold Work',
  description: 'A record of original paintings by Des Green that have found new homes.',
};

export default async function SoldWorkPage() {
  const artworks = await listSoldWorks();

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <SectionHeading eyebrow="Found New Homes" title="Sold Work" />
      <p className="mt-4 max-w-2xl text-base text-charcoal-soft">
        A record of originals that have already found their place. Each one is unique and cannot be purchased again.
      </p>

      <div className="mt-10">
        {artworks.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-charcoal-soft">No sold works to show yet.</p>
          </div>
        ) : (
          <GalleryGrid artworks={artworks} />
        )}
      </div>
    </div>
  );
}
