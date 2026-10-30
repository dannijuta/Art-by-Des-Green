import type { Metadata } from 'next';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/section-heading';
import { FacebookIcon, InstagramIcon } from '@/components/icons/social';
import { listPublicExhibitions, formatExhibitionDates, type Exhibition } from '@/lib/data/exhibitions';
import { getContactSettings } from '@/lib/data/settings';
import { PUBLIC_LOCATION } from '@/lib/local-business';

export const metadata: Metadata = {
  title: 'Exhibitions',
  description: `Upcoming and past exhibitions by South African artist Des Green — meet the artist and see her original oil paintings in person. Based in ${PUBLIC_LOCATION}.`,
  alternates: { canonical: '/exhibitions' },
  openGraph: { url: '/exhibitions' },
};

function ExhibitionItem({ ex, past = false }: { ex: Exhibition; past?: boolean }) {
  return (
    <article className="grid gap-6 border-t border-border-soft py-10 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-10">
      {ex.imagePath ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
          <Image
            src={ex.imagePath}
            alt={`${ex.title} at ${ex.venue}, ${ex.town}`}
            fill
            sizes="(min-width: 640px) 30vw, 92vw"
            className={`object-cover ${past ? 'opacity-90' : ''}`}
          />
        </div>
      ) : (
        <div className="hidden sm:block">
          <p className="font-serif text-2xl text-clay-dark">{formatExhibitionDates(ex.startDate, ex.endDate)}</p>
        </div>
      )}
      <div>
        <p className={`text-[0.7rem] tracking-[0.28em] text-clay-dark ${ex.imagePath ? '' : 'sm:hidden'}`}>
          {formatExhibitionDates(ex.startDate, ex.endDate).toUpperCase()}
        </p>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-charcoal sm:text-[1.75rem]">{ex.title}</h3>
        <p className="mt-2 text-sm tracking-wide text-charcoal-soft">
          {ex.venue} · {ex.town}
        </p>
        {ex.description && (
          <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-charcoal-soft">{ex.description}</p>
        )}
        {ex.linkUrl && (
          <a
            href={ex.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm text-clay-dark underline underline-offset-4 hover:text-clay"
          >
            {past ? 'More about this exhibition' : 'Event details'} →
          </a>
        )}
      </div>
    </article>
  );
}

export default async function ExhibitionsPage() {
  const [{ upcoming, past }, contact] = await Promise.all([listPublicExhibitions(), getContactSettings()]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
      <SectionHeading as="h1" eyebrow="Meet the Artist" title="Exhibitions" />
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-charcoal-soft">
        See Des Green&rsquo;s original oil paintings in person and meet the artist. Here is where she&rsquo;ll be
        exhibiting next, and where her work has been shown before.
      </p>

      <section className="mt-14" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="font-serif text-2xl text-charcoal sm:text-3xl">
          Upcoming Exhibitions
        </h2>
        <div className="mt-4 h-px w-16 bg-clay" />
        <div className="mt-10">
          {upcoming.length > 0 ? (
            upcoming.map((ex) => <ExhibitionItem key={ex.id} ex={ex} />)
          ) : (
            <div className="border border-border-soft bg-parchment/60 px-6 py-12 text-center sm:px-12">
              <p className="font-serif text-xl text-charcoal sm:text-2xl">New exhibitions coming soon</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-soft">
                Follow Des on Instagram or Facebook to be the first to hear where she&rsquo;ll be exhibiting next.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-charcoal px-5 py-2.5 text-sm text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
                >
                  <InstagramIcon className="h-4 w-4" /> Instagram
                </a>
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-charcoal px-5 py-2.5 text-sm text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
                >
                  <FacebookIcon className="h-4 w-4" /> Facebook
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-20" aria-labelledby="past-heading">
        <h2 id="past-heading" className="font-serif text-2xl text-charcoal sm:text-3xl">
          Past Exhibitions
        </h2>
        <div className="mt-4 h-px w-16 bg-clay" />
        <div className="mt-10">
          {past.length > 0 ? (
            past.map((ex) => <ExhibitionItem key={ex.id} ex={ex} past />)
          ) : (
            <p className="text-sm text-charcoal-soft">Past exhibitions will be listed here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
