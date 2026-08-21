import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center sm:px-8">
      <p className="text-xs tracking-[0.25em] text-clay-dark">404</p>
      <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-charcoal-soft">
        The page you&apos;re looking for doesn&apos;t exist, or the artwork may have been renamed or removed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream">
          Return Home
        </Link>
        <Link
          href="/gallery"
          className="inline-flex items-center justify-center border border-charcoal px-6 py-3 text-sm tracking-wide text-charcoal"
        >
          Browse the Gallery
        </Link>
      </div>
    </div>
  );
}
