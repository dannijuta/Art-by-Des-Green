import type { AvailabilityStatus } from '@/types/domain';
import { isRecentlyAdded } from '@/lib/artwork-new';

const LABELS: Partial<Record<AvailabilityStatus, string>> = {
  sold: 'Sold',
  reserved: 'Reserved',
  private_collection: 'Private Collection',
};

export function AvailabilityBadge({ status, createdAt }: { status: AvailabilityStatus; createdAt?: string }) {
  const label = LABELS[status];
  if (label) {
    return (
      <span className="inline-flex items-center bg-charcoal/85 px-3 py-1 text-[0.7rem] tracking-[0.15em] text-cream">
        {label.toUpperCase()}
      </span>
    );
  }

  if (status === 'available' && createdAt && isRecentlyAdded(createdAt)) {
    return (
      <span className="inline-flex items-center bg-clay px-3 py-1 text-[0.7rem] tracking-[0.15em] text-cream">
        NEW
      </span>
    );
  }

  return null;
}
