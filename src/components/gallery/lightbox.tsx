'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import type { Artwork } from '@/types/domain';
import { formatZAR } from '@/lib/money';
import { AvailabilityBadge } from '@/components/artwork/availability-badge';

export function Lightbox({
  artworks,
  index,
  onClose,
  onNavigate,
}: {
  artworks: Artwork[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const artwork = artworks[index];
  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + artworks.length) % artworks.length);
  }, [index, artworks.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % artworks.length);
  }, [index, artworks.length, onNavigate]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, goPrev, goNext]);

  if (!artwork) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={artwork.publicTitle}
      className="fixed inset-0 z-50 flex flex-col bg-charcoal/97 text-cream"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > 50) goPrev();
        else if (delta < -50) goNext();
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="text-sm text-cream/70">
          {index + 1} / {artworks.length}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="p-2 text-cream focus-visible:outline-2 focus-visible:outline-cream"
        >
          <span className="sr-only">Close</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 p-3 text-cream sm:block focus-visible:outline-2 focus-visible:outline-cream"
          aria-label="Previous artwork"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative h-full max-h-[70vh] w-full max-w-4xl">
          {artwork.primaryImagePath && (
            <Image
              src={artwork.primaryImagePath}
              alt={artwork.altText || artwork.publicTitle}
              fill
              sizes="90vw"
              className="object-contain"
              quality={90}
            />
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 p-3 text-cream sm:block focus-visible:outline-2 focus-visible:outline-cream"
          aria-label="Next artwork"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream/15 px-5 py-4 sm:px-8">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-serif text-lg italic">{artwork.publicTitle}</p>
            {artwork.availabilityStatus !== 'available' && <AvailabilityBadge status={artwork.availabilityStatus} />}
          </div>
          <p className="mt-1 text-sm text-cream/70">
            {artwork.widthCm && artwork.heightCm ? `${artwork.widthCm} × ${artwork.heightCm} cm` : null}
            {artwork.priceCents !== null && artwork.availabilityStatus === 'available'
              ? `${artwork.widthCm ? ' · ' : ''}${formatZAR(artwork.priceCents)}`
              : ''}
          </p>
        </div>
        <Link
          href={`/artwork/${artwork.slug}`}
          className="border border-cream px-4 py-2 text-sm text-cream transition-colors hover:bg-cream hover:text-charcoal"
        >
          View full details →
        </Link>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {artwork.publicTitle}, image {index + 1} of {artworks.length}
      </p>
    </div>
  );
}
