import type { AvailabilityStatus } from '@/types/domain';

const LABELS: Partial<Record<AvailabilityStatus, string>> = {
  sold: 'Sold',
  reserved: 'Reserved',
  private_collection: 'Private Collection',
};

export function AvailabilityBadge({ status, isNew }: { status: AvailabilityStatus; isNew?: boolean }) {
  const label = LABELS[status];
  if (label) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-charcoal shadow-sm ring-1 ring-charcoal/10 backdrop-blur-sm">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${status === 'sold' ? 'bg-[#b3261e]' : 'bg-clay'}`} />
        {label}
      </span>
    );
  }

  if (status === 'available' && isNew) {
    return (
      <span className="inline-flex items-center rounded-full bg-clay px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-cream shadow-sm">
        New
      </span>
    );
  }

  return null;
}
