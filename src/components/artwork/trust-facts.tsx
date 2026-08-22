import type { Artwork } from '@/types/domain';

/** Only ever renders facts that are explicitly known — a null value means
 * "not yet confirmed," and is simply omitted rather than guessed. */
export function TrustFacts({ artwork }: { artwork: Artwork }) {
  const facts: string[] = [];
  if (artwork.signed !== null) facts.push(artwork.signed ? 'Signed by the artist' : 'Unsigned');
  if (artwork.varnished !== null) facts.push(artwork.varnished ? 'Varnished' : 'Unvarnished');
  if (artwork.certificateOfAuthenticity !== null) {
    facts.push(artwork.certificateOfAuthenticity ? 'Certificate of authenticity included' : 'No certificate of authenticity');
  }

  if (facts.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-soft">
      {facts.map((fact) => (
        <li key={fact} className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-olive">
            <path d="M2 6.5 5 9.5 10 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {fact}
        </li>
      ))}
    </ul>
  );
}
