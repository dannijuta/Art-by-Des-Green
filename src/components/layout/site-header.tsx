'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ArtistProfileSettings } from '@/types/domain';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/meet-the-artist', label: 'About the Artist' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/available-works', label: 'Available Works' },
  { href: '/sold-work', label: 'Sold Work' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ artist }: { artist: ArtistProfileSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border-soft bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl italic text-clay-dark sm:text-3xl">Art by Des</span>
          <span className="mt-1 text-[0.65rem] tracking-[0.3em] text-charcoal-soft">
            {artist.name.toUpperCase()}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors hover:text-clay-dark ${
                pathname === link.href ? 'text-clay-dark' : 'text-charcoal'
              }`}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          {artist.commissionsOpen && (
            <Link
              href="/commissions"
              className="inline-flex items-center gap-2 border border-clay px-4 py-2 text-xs tracking-wide text-clay-dark transition-colors hover:bg-clay hover:text-cream"
            >
              Commission an Artwork
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex items-center justify-center p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l14 14M20 6 6 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 8h18M4 13h18M4 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>
    </header>

    <div
      id="mobile-nav"
      className={`fixed inset-x-0 top-[73px] bottom-0 z-30 overflow-y-auto bg-ivory transition-transform duration-300 lg:hidden ${
        open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      <nav className="flex flex-col gap-1 px-6 py-8" aria-label="Mobile">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-b border-border-soft py-4 text-lg font-serif text-charcoal"
          >
            {link.label}
          </Link>
        ))}
        {artist.commissionsOpen && (
          <Link
            href="/commissions"
            className="mt-6 inline-flex items-center justify-center border border-clay px-4 py-3 text-sm tracking-wide text-clay-dark"
          >
            Commission an Artwork
          </Link>
        )}
      </nav>
    </div>
    </>
  );
}
