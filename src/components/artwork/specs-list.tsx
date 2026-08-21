import type { Artwork } from '@/types/domain';

export function SpecsList({ artwork }: { artwork: Artwork }) {
  const rows: Array<[string, string]> = [];

  if (artwork.category) rows.push(['Category', artwork.category.name]);
  if (artwork.widthCm && artwork.heightCm) {
    rows.push(['Dimensions', `${artwork.widthCm} × ${artwork.heightCm} cm`]);
  }
  if (artwork.medium) rows.push(['Medium', artwork.medium]);
  if (artwork.surface) rows.push(['Surface', artwork.surface]);
  if (artwork.framed !== null) rows.push(['Framing', artwork.framed ? 'Framed' : 'Unframed']);

  if (rows.length === 0) return null;

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-charcoal-soft">{label}</dt>
          <dd className="text-charcoal">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
