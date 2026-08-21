import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArtistProfile, getContactSettings } from '@/lib/data/settings';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Meet the Artist',
  description: 'Meet Des Green, a South African oil painter based in East London.',
};

export default async function MeetTheArtistPage() {
  const [artist, contact] = await Promise.all([getArtistProfile(), getContactSettings()]);

  return (
    <div>
      <section className="border-b border-border-soft bg-ivory">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-parchment">
            {artist.studioImagePath ? (
              <Image
                src={artist.studioImagePath}
                alt={artist.studioImageAlt || 'Des Green working on a painting in her studio.'}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-[center_25%]"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-border p-8 text-center text-sm text-charcoal-soft">
                Studio photograph to be added via the admin dashboard.
              </div>
            )}
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] text-clay-dark">ABOUT THE ARTIST</p>
            <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Meet {artist.name}</h1>
            <p className="mt-2 text-sm text-charcoal-soft">
              {artist.professionalDescription} · {artist.basedIn}
            </p>
            {artist.introLine && (
              <p className="mt-6 max-w-md font-serif text-xl italic leading-relaxed text-charcoal-soft">
                {artist.introLine}
              </p>
            )}
            {artist.commissionsOpen && (
              <Link
                href="/commissions"
                className="mt-8 inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream transition-colors hover:bg-clay-dark"
              >
                Commission an Artwork
              </Link>
            )}
          </div>
        </div>
      </section>

      {artist.bioParagraphs.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <SectionHeading title="Her Story" />
          <div className="mt-8 space-y-6">
            {artist.bioParagraphs.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-charcoal-soft">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-10 font-serif text-xl italic text-clay-dark">{artist.signatureName}</p>
        </section>
      )}

      <section className="border-t border-border-soft bg-charcoal">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h2 className="font-serif text-3xl text-cream sm:text-4xl">Private Enquiries</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/80">
            Questions about a piece, its availability, or a commission? Des replies to every enquiry personally.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-cream px-6 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-cream/90"
            >
              Get in Touch
            </Link>
            {artist.commissionsOpen && (
              <Link
                href="/commissions"
                className="inline-flex items-center justify-center border border-cream px-6 py-3 text-sm tracking-wide text-cream transition-colors hover:bg-cream hover:text-charcoal"
              >
                Commission an Artwork
              </Link>
            )}
          </div>
          <p className="mt-6 text-sm text-cream/60">
            {contact.phoneDisplay} · {contact.email}
          </p>
        </div>
      </section>
    </div>
  );
}
