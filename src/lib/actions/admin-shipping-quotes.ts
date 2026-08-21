'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { randToCents } from '@/lib/money';
import { sendEmail, escapeHtml } from '@/lib/email';

export async function approveShippingQuote(formData: FormData) {
  await requireAdmin();

  const quoteId = String(formData.get('quoteId'));
  const shippingRand = Number.parseFloat(String(formData.get('shippingRand') || '0'));
  const shippingCents = Number.isFinite(shippingRand) && shippingRand >= 0 ? randToCents(shippingRand) : 0;

  const { rows } = await query<{ order_id: string }>('select order_id from shipping_quote_requests where id = $1', [
    quoteId,
  ]);
  const orderId = rows[0]?.order_id;
  if (!orderId) return;

  const orderRes = await query<{ artwork_price_cents: number; customer_email: string; customer_name: string; order_number: string }>(
    'select artwork_price_cents, customer_email, customer_name, order_number from orders where id = $1',
    [orderId]
  );
  const order = orderRes.rows[0];
  if (!order) return;

  const totalCents = order.artwork_price_cents + shippingCents;

  await query(
    `update shipping_quote_requests set status = 'quoted', quoted_shipping_cents = $1, updated_at = now() where id = $2`,
    [shippingCents, quoteId]
  );
  await query(`update orders set shipping_cents = $1, total_cents = $2, status = 'awaiting_payment' where id = $3`, [
    shippingCents,
    totalCents,
    orderId,
  ]);
  await query(`update shipping_quote_requests set status = 'approved' where id = $1`, [quoteId]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const payLink = `${siteUrl}/checkout/pay/${orderId}`;

  await sendEmail({
    to: order.customer_email,
    subject: `Your shipping quote is ready — order ${order.order_number}`,
    html: `
      <p>Hi ${escapeHtml(order.customer_name)},</p>
      <p>Thank you for your patience. Your shipping cost has been confirmed.</p>
      <p><strong>Shipping:</strong> R ${(shippingCents / 100).toFixed(2)}</p>
      <p><strong>Total:</strong> R ${(totalCents / 100).toFixed(2)}</p>
      <p>You can complete your secure payment here: <a href="${payLink}">${payLink}</a></p>
    `,
  });

  revalidatePath('/admin/shipping-quotes');
  revalidatePath('/admin/orders');
}
