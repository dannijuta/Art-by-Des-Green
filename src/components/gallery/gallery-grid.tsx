'use client';

import { useState } from 'react';
import type { Artwork } from '@/types/domain';
import { ArtworkCard } from '@/components/artwork/artwork-card';
import { Lightbox } from './lightbox';

export function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
      <div className="columns-2 gap-6 sm:columns-2 md:columns-3 lg:columns-4">
        {artworks.map((artwork, i) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            priority={i < 4}
            onOpen={(e) => {
              e.preventDefault();
              setOpenIndex(i);
            }}
          />
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          artworks={artworks}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
