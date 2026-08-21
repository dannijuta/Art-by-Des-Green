import type { Metadata } from 'next';
import { listPublishedArtworks, listCategories } from '@/lib/data/artworks';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { FilterBar } from '@/components/gallery/filter-bar';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'The complete collection of original oil paintings by South African artist Des Green.',
};

export default async function GalleryPage({ searchParams }: PageProps<'/gallery'>) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const availability =
    params.availability === 'available' || params.availability === 'sold' ? params.availability : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const [artworks, categories] = await Promise.all([
    listPublishedArtworks({ category, availability, search }),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <SectionHeading eyebrow="The Complete Collection" title="Gallery" />
      <p className="mt-4 max-w-2xl text-base text-charcoal-soft">
        Every original painting, from wildlife and portraiture to coastal scenes and city light. Filter by category
        or availability, or search by title.
      </p>

      <div className="mt-8">
        <FilterBar categories={categories} />
      </div>

      <div className="mt-10">
        <GalleryGrid artworks={artworks} />
      </div>
    </div>
  );
}
