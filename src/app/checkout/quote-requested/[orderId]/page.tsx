import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/data/orders';
import { SectionHeading } from '@/components/ui/section-heading';
import { TrackLead } from '@/components/analytics/track-lead';

export const metadata = { title: 'Shipping Quote Requested', robots: { index: false } };

export default async function QuoteRequestedPage(props: PageProps<'/checkout/quote-requested/[orderId]'>) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <TrackLead orderId={order.id} orderNumber={order.orderNumber} totalCents={order.totalCents} />

      <SectionHeading as="h1" title="Shipping Quote Requested" />
      <p className="mt-4 text-charcoal-soft">
        Thank you — this artwork has been reserved for you while Des prepares a shipping quote for your address.
        You&apos;ll receive an email with the shipping cost and a secure payment link shortly.
      </p>
      <p className="mt-6 text-sm text-charcoal-soft">
        Order reference: <span className="text-charcoal">{order.orderNumber}</span>
      </p>
      <Link href="/gallery" className="mt-8 inline-block text-clay-dark underline underline-offset-4">
        Continue browsing the collection
      </Link>
    </div>
  );
}
