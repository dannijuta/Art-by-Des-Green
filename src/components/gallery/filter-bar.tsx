'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Category } from '@/types/domain';

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');

  const activeCategory = searchParams.get('category') ?? '';
  const activeAvailability = searchParams.get('availability') ?? '';

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchValue || null });
  }

  const hasActiveFilters = activeCategory || activeAvailability || searchParams.get('search');

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearchSubmit} role="search" aria-label="Search the gallery">
        <label htmlFor="gallery-search" className="sr-only">
          Search artworks by title
        </label>
        <div className="flex max-w-md gap-2">
          <input
            id="gallery-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by title…"
            className="w-full border border-border bg-cream px-4 py-2 text-sm text-charcoal placeholder:text-charcoal-soft focus-visible:outline-2 focus-visible:outline-clay"
          />
          <button
            type="submit"
            className="border border-charcoal px-4 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by availability">
        {[
          { label: 'All', value: '' },
          { label: 'Available', value: 'available' },
          { label: 'Sold', value: 'sold' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateParams({ availability: opt.value || null })}
            aria-pressed={activeAvailability === opt.value}
            className={`border px-3 py-1.5 text-xs tracking-wide transition-colors ${
              activeAvailability === opt.value
                ? 'border-clay bg-clay text-cream'
                : 'border-border text-charcoal-soft hover:border-clay hover:text-clay-dark'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => updateParams({ category: null })}
          aria-pressed={activeCategory === ''}
          className={`border px-3 py-1.5 text-xs tracking-wide transition-colors ${
            activeCategory === ''
              ? 'border-clay bg-clay text-cream'
              : 'border-border text-charcoal-soft hover:border-clay hover:text-clay-dark'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => updateParams({ category: cat.slug })}
            aria-pressed={activeCategory === cat.slug}
            className={`border px-3 py-1.5 text-xs tracking-wide transition-colors ${
              activeCategory === cat.slug
                ? 'border-clay bg-clay text-cream'
                : 'border-border text-charcoal-soft hover:border-clay hover:text-clay-dark'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setSearchValue('');
            router.push(pathname, { scroll: false });
          }}
          className="text-xs text-clay-dark underline underline-offset-4"
        >
          Clear all filters
        </button>
      )}

      <p aria-live="polite" className="sr-only">
        {isPending ? 'Updating results…' : ''}
      </p>
    </div>
  );
}
