import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/data/orders';
import { formatZAR } from '@/lib/money';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata = { title: 'Payment Status' };

export default async function CheckoutSuccessPage(props: PageProps<'/checkout/success/[orderId]'>) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  const confirmed = order.status === 'paid' || order.status === 'sold';

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <SectionHeading title={confirmed ? 'Payment Confirmed' : 'Confirming Your Payment'} />

      {confirmed ? (
        <>
          <p className="mt-4 text-charcoal-soft">
            Thank you — your payment has been confirmed. Des will be in touch shortly to arrange next steps.
          </p>
          <p className="mt-6 text-sm text-charcoal-soft">
            Order reference: <span className="text-charcoal">{order.orderNumber}</span>
            <br />
            Total paid: <span className="text-charcoal">{order.totalCents !== null ? formatZAR(order.totalCents) : '—'}</span>
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-charcoal-soft">
            We&apos;ve received you back from PayFast and we&apos;re waiting for their final confirmation — this
            usually takes just a moment. Refresh this page shortly to see the update.
          </p>
          <p className="mt-6 text-sm text-charcoal-soft">
            Order reference: <span className="text-charcoal">{order.orderNumber}</span>
          </p>
        </>
      )}

      <Link href="/gallery" className="mt-8 inline-block text-clay-dark underline underline-offset-4">
        Continue browsing the collection
      </Link>
    </div>
  );
}
