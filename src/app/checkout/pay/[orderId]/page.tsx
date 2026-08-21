import { notFound, redirect } from 'next/navigation';
import { getOrderById, getOrderItemArtworkId, markOrderAwaitingPayment } from '@/lib/data/orders';
import { query } from '@/lib/db';
import { payfastProvider } from '@/lib/payments/payfast';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata = { title: 'Redirecting to secure payment' };

export default async function CheckoutPayPage(props: PageProps<'/checkout/pay/[orderId]'>) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  if (order.status === 'paid' || order.status === 'sold') {
    redirect(`/checkout/success/${orderId}`);
  }
  if (!['reserved', 'awaiting_payment'].includes(order.status) || order.totalCents === null) {
    redirect(`/checkout/cancelled/${orderId}`);
  }

  const artworkId = await getOrderItemArtworkId(orderId);
  const { rows } = await query<{ public_title: string }>('select public_title from artworks where id = $1', [
    artworkId,
  ]);
  const itemName = rows[0]?.public_title || 'Original artwork';

  await markOrderAwaitingPayment(orderId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { actionUrl, fields } = payfastProvider.buildPaymentForm({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountCents: order.totalCents!,
    itemName,
    itemDescription: `Original painting — order ${order.orderNumber}`,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    returnUrl: `${siteUrl}/checkout/success/${orderId}`,
    cancelUrl: `${siteUrl}/checkout/cancelled/${orderId}`,
    notifyUrl: `${siteUrl}/api/payfast/itn`,
  });

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
      <SectionHeading title="Redirecting to secure payment…" />
      <p className="mt-4 text-sm text-charcoal-soft">
        You&apos;re being taken to PayFast&apos;s secure payment page. This website never sees or stores your card
        details.
      </p>

      <form action={actionUrl} method="POST" id="payfast-form" className="mt-8">
        {Object.entries(fields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <noscript>
          <button
            type="submit"
            className="inline-flex items-center justify-center bg-clay px-6 py-3 text-sm tracking-wide text-cream"
          >
            Continue to Secure Payment
          </button>
        </noscript>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('payfast-form').submit();`,
        }}
      />
    </div>
  );
}
