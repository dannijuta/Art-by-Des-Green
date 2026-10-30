import Image from 'next/image';
import Link from 'next/link';
import type { Artwork, HomepageCopySettings } from '@/types/domain';

export function Hero({ hero, copy }: { hero: Artwork | null; copy: HomepageCopySettings }) {
  return (
    <section className="border-b border-border-soft bg-ivory">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-28">
        <div>
          <p className="text-[0.7rem] tracking-[0.3em] text-clay-dark">{copy.eyebrow.toUpperCase()}</p>
          <h1 className="mt-5 max-w-xl font-serif text-[2.6rem] leading-[1.08] tracking-[-0.01em] text-charcoal sm:text-6xl lg:text-[4.2rem]">
            {copy.headline}
          </h1>
          <div className="mt-7 h-px w-16 bg-clay" />
          <p className="mt-7 max-w-md text-[1.05rem] leading-[1.8] text-charcoal-soft">{copy.supportingCopy}</p>
          <div className="mt-10 flex flex-wrap gap-4">
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
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-parchment sm:aspect-[5/4]">
              <div className="absolute inset-[6%]">
                <Image
                  src={hero.primaryImagePath}
                  alt={hero.altText || hero.publicTitle}
                  fill
                  sizes="(min-width: 1024px) 50vw, 92vw"
                  className="object-contain drop-shadow-[0_18px_30px_rgba(42,36,30,0.28)]"
                  priority
                />
              </div>
            </div>
            <p className="mt-3 text-right font-serif text-sm italic text-charcoal-soft">
              <Link href={`/artwork/${hero.slug}`} className="underline-offset-4 hover:text-clay-dark hover:underline">
                {hero.publicTitle}
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
