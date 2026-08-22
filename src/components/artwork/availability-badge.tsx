import type { AvailabilityStatus } from '@/types/domain';

const LABELS: Partial<Record<AvailabilityStatus, string>> = {
  sold: 'Sold',
  reserved: 'Reserved',
  private_collection: 'Private Collection',
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <span className="inline-flex items-center bg-charcoal/85 px-3 py-1 text-[0.7rem] tracking-[0.15em] text-cream">
      {label.toUpperCase()}
    </span>
  );
}
