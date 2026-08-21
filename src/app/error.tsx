'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center sm:px-8">
      <p className="text-xs tracking-[0.25em] text-clay-dark">SOMETHING WENT WRONG</p>
      <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">We hit a snag</h1>
      <p className="mt-4 text-charcoal-soft">
        Something didn&apos;t load correctly. Please try again — if the problem continues, get in touch.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-charcoal px-6 py-3 text-sm tracking-wide text-charcoal"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
