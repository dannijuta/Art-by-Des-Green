import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/data/orders';
import { getContactSettings } from '@/lib/data/settings';
import { formatZAR } from '@/lib/money';
import { SectionHeading } from '@/components/ui/section-heading';
import { TrackLead } from '@/components/analytics/track-lead';

export const metadata = { title: 'Purchase Request Received', robots: { index: false } };

export default async function CheckoutReservedPage(props: PageProps<'/checkout/reserved/[orderId]'>) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  const contact = await getContactSettings();

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <TrackLead orderId={order.id} orderNumber={order.orderNumber} totalCents={order.totalCents} />

      <SectionHeading as="h1" title="Purchase Request Received" />
      <p className="mt-4 text-charcoal-soft">
        Thank you — this artwork has been reserved for you. Payment will be arranged securely once your shipping or
        collection details have been confirmed. Des will be in touch at <strong>{order.customerEmail}</strong>
        {contact.phoneDisplay ? ` or you're welcome to call ${contact.phoneDisplay}` : ''} to arrange next steps.
      </p>
      <div className="mt-6 space-y-1 text-sm text-charcoal-soft">
        <p>
          Order reference: <span className="text-charcoal">{order.orderNumber}</span>
        </p>
        {order.totalCents !== null && (
          <p>
            Total: <span className="text-charcoal">{formatZAR(order.totalCents)}</span>
          </p>
        )}
      </div>
      <Link href="/gallery" className="mt-8 inline-block text-clay-dark underline underline-offset-4">
        Continue browsing the collection
      </Link>
    </div>
  );
}
