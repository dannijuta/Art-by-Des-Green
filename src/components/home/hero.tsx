import Image from 'next/image';
import Link from 'next/link';
import type { Artwork, HomepageCopySettings } from '@/types/domain';

export function Hero({ hero, copy }: { hero: Artwork | null; copy: HomepageCopySettings }) {
  return (
    <section className="border-b border-border-soft bg-ivory">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs tracking-[0.25em] text-clay-dark">{copy.eyebrow.toUpperCase()}</p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight text-charcoal sm:text-5xl lg:text-[3.4rem]">
            {copy.headline}
          </h1>
          <div className="mt-4 h-px w-16 bg-clay" />
          <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal-soft">{copy.supportingCopy}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={copy.primaryCtaHref}
              className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream transition-colors hover:bg-clay-dark"
            >
              {copy.primaryCtaLabel}
            </Link>
            <Link
              href={copy.secondaryCtaHref}
              className="inline-flex items-center justify-center border border-charcoal px-6 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
            >
              {copy.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        {hero?.primaryImagePath && (
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-parchment">
              <Image
                src={hero.primaryImagePath}
                alt={hero.altText || hero.publicTitle}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
