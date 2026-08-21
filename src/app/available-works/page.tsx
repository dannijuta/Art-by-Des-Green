import type { Metadata } from 'next';
import { listAvailableWorks } from '@/lib/data/artworks';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Available Works',
  description: 'Original oil paintings currently available to purchase from South African artist Des Green.',
};

export default async function AvailableWorksPage() {
  const artworks = await listAvailableWorks();

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <SectionHeading eyebrow="Originals for Sale" title="Available Works" />
      <p className="mt-4 max-w-2xl text-base text-charcoal-soft">
        Every piece here is an original, one-of-a-kind painting, ready to find a new home. Once a painting sells it
        is removed from this page.
      </p>

      <div className="mt-10">
        {artworks.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-16 text-center">
            <p className="font-serif text-xl text-charcoal">No works are available for purchase right now</p>
            <p className="mt-2 text-sm text-charcoal-soft">
              Browse the full <a href="/gallery" className="underline underline-offset-4">gallery</a>, or get in
              touch to hear about new originals first.
            </p>
          </div>
        ) : (
          <GalleryGrid artworks={artworks} />
        )}
      </div>
    </div>
  );
}
