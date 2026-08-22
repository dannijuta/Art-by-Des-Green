import Link from 'next/link';
import type { ArtistProfileSettings, ContactSettings } from '@/types/domain';
import { FacebookIcon, InstagramIcon, MailIcon } from '@/components/icons/social';

export function SiteFooter({
  artist,
  contact,
  showSoldWork,
}: {
  artist: ArtistProfileSettings;
  contact: ContactSettings;
  showSoldWork: boolean;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-soft bg-parchment">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div>
          <span className="font-serif text-2xl italic text-clay-dark">Art by Des</span>
          <p className="mt-1 text-[0.65rem] tracking-[0.3em] text-charcoal-soft">{artist.name.toUpperCase()}</p>
          <p className="mt-4 max-w-xs text-sm text-charcoal-soft">{contact.location}</p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-xs tracking-[0.2em] text-charcoal-soft">NAVIGATION</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-clay-dark">Home</Link></li>
            <li><Link href="/meet-the-artist" className="hover:text-clay-dark">About the Artist</Link></li>
            <li><Link href="/gallery" className="hover:text-clay-dark">Gallery</Link></li>
            <li><Link href="/available-works" className="hover:text-clay-dark">Available Works</Link></li>
            {showSoldWork && (
              <li><Link href="/sold-work" className="hover:text-clay-dark">Sold Work</Link></li>
            )}
            <li><Link href="/contact" className="hover:text-clay-dark">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs tracking-[0.2em] text-charcoal-soft">CONNECT</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={contact.phoneLink}
                className="hover:text-clay-dark"
              >
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={contact.emailLink} className="inline-flex items-center gap-2 hover:text-clay-dark">
                <MailIcon className="h-4 w-4 shrink-0" />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-clay-dark"
                aria-label={contact.facebookLabel}
              >
                <FacebookIcon className="h-4 w-4 shrink-0" />
                Facebook
              </a>
            </li>
            <li>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-clay-dark"
                aria-label={contact.instagramLabel}
              >
                <InstagramIcon className="h-4 w-4 shrink-0" />
                {contact.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs tracking-[0.2em] text-charcoal-soft">POLICIES</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/legal/privacy-policy" className="hover:text-clay-dark">Privacy Policy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-clay-dark">Terms &amp; Conditions</Link></li>
            <li><Link href="/legal/shipping-and-collection" className="hover:text-clay-dark">Shipping &amp; Collection</Link></li>
            <li><Link href="/legal/returns-and-refunds" className="hover:text-clay-dark">Returns &amp; Refunds</Link></li>
            <li><Link href="/legal/copyright" className="hover:text-clay-dark">Copyright</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-soft py-6">
        <p className="mx-auto max-w-7xl px-5 text-center text-xs text-charcoal-soft sm:px-8">
          © {year} Art by Des Green. All artwork and images remain the property of the artist. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
