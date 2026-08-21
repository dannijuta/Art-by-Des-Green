import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById, getOrderItemArtworkId, releaseReservation } from '@/lib/data/orders';
import { query } from '@/lib/db';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata = { title: 'Payment Cancelled' };

export default async function CheckoutCancelledPage(props: PageProps<'/checkout/cancelled/[orderId]'>) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  if (['reserved', 'quote_required', 'awaiting_payment'].includes(order.status)) {
    await releaseReservation(orderId);
  }

  const artworkId = await getOrderItemArtworkId(orderId);
  const { rows } = await query<{ slug: string }>('select slug from artworks where id = $1', [artworkId]);
  const artworkSlug = rows[0]?.slug;

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <SectionHeading title="Payment Cancelled" />
      <p className="mt-4 text-charcoal-soft">
        No payment was taken and your reservation on this artwork has been released, so it&apos;s available for
        anyone to purchase again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {artworkSlug && (
          <Link
            href={`/artwork/${artworkSlug}`}
            className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream"
          >
            Return to Artwork
          </Link>
        )}
        <Link
          href="/available-works"
          className="inline-flex items-center justify-center border border-charcoal px-6 py-3 text-sm tracking-wide text-charcoal"
        >
          Browse Available Works
        </Link>
      </div>
    </div>
  );
}
