import type { Artwork } from '@/types/domain';
import { ArtworkCard } from '@/components/artwork/artwork-card';

export function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-16 text-center">
        <p className="font-serif text-xl text-charcoal">No artworks match your filters</p>
        <p className="mt-2 text-sm text-charcoal-soft">Try clearing a filter or searching a different term.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-14">
        {artworks.map((artwork, i) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            priority={i < 4}
          />
        ))}
      </div>
    </>
  );
}
