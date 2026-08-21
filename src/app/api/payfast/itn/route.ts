import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { payfastProvider } from '@/lib/payments/payfast';

export const runtime = 'nodejs';

/**
 * PayFast's Instant Transaction Notification webhook. This is the ONLY place
 * an order is ever marked paid/sold — the return_url the customer's browser
 * hits after payment is never trusted for that (see /checkout/success), since
 * a customer can reach that URL without having actually paid.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Best-effort source IP (informational check inside validateNotification —
  // see the comment there on why it isn't the sole gate).
  const forwardedFor = request.headers.get('x-forwarded-for');
  const sourceIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

  const params = new URLSearchParams(rawBody);
  const merchantPaymentId = params.get('m_payment_id');

  let expectedAmountCents = 0;
  let orderId: string | null = null;
  if (merchantPaymentId) {
    const { rows } = await query<{ id: string; total_cents: number | null; status: string }>(
      'select id, total_cents, status from orders where payfast_payment_id = $1',
      [merchantPaymentId]
    );
    if (rows[0]) {
      orderId = rows[0].id;
      expectedAmountCents = rows[0].total_cents ?? 0;
    }
  }

  let validation;
  try {
    validation = await payfastProvider.validateNotification({ rawBody, sourceIp, expectedAmountCents });
  } catch (err) {
    console.error('PayFast ITN validation threw an error:', err);
    // Return non-200 here (unlike below) so PayFast retries — this is an
    // unexpected internal failure, not a rejected/invalid notification.
    return new NextResponse('error', { status: 500 });
  }

  // Log every notification, valid or not — this is the audit trail.
  await query(
    `insert into payment_notifications
      (order_id, provider, signature_valid, amount_valid, raw_body, pf_payment_id, payment_status, processed)
     values ($1,'payfast',$2,$3,$4,$5,$6,$7)`,
    [
      orderId,
      validation.reasons.includes('signature_mismatch') ? false : true,
      !validation.reasons.includes('amount_mismatch'),
      rawBody,
      validation.providerPaymentId ?? null,
      validation.paymentStatus ?? null,
      false,
    ]
  );

  if (!validation.valid) {
    console.warn('Rejected PayFast ITN:', validation.reasons.join(', '));
    // Acknowledge receipt with 200 so PayFast stops retrying a notification
    // that will never pass (bad signature, wrong merchant, tampered amount).
    return new NextResponse('invalid', { status: 200 });
  }

  if (!orderId) {
    console.error('Valid PayFast signature but no matching order for m_payment_id:', merchantPaymentId);
    return new NextResponse('no matching order', { status: 200 });
  }

  if (validation.paymentStatus !== 'COMPLETE') {
    // CANCELLED or other non-final statuses: acknowledged, no state change.
    return new NextResponse('ok', { status: 200 });
  }

  await processCompletedPayment({
    orderId,
    pfPaymentId: validation.providerPaymentId ?? '',
    amountGrossCents: validation.amountGrossCents ?? expectedAmountCents,
    rawBody,
  });

  return new NextResponse('ok', { status: 200 });
}

async function processCompletedPayment(args: {
  orderId: string;
  pfPaymentId: string;
  amountGrossCents: number;
  rawBody: string;
}) {
  await withTransaction(async (client) => {
    // Idempotency: if we've already recorded a completed payment for this
    // PayFast transaction, do nothing — PayFast can and does resend ITNs.
    if (args.pfPaymentId) {
      const existing = await client.query(
        `select id from payments where provider = 'payfast' and provider_payment_id = $1 and status = 'completed'`,
        [args.pfPaymentId]
      );
      if ((existing.rowCount ?? 0) > 0) return;
    }

    const orderRes = await client.query<{ status: string }>('select status from orders where id = $1 for update', [
      args.orderId,
    ]);
    if (!orderRes.rows[0] || orderRes.rows[0].status === 'paid' || orderRes.rows[0].status === 'sold') {
      return;
    }

    await client.query(
      `insert into payments (order_id, provider, amount_cents, status, provider_payment_id, raw_payload)
       values ($1,'payfast',$2,'completed',$3,$4)`,
      [args.orderId, args.amountGrossCents, args.pfPaymentId, JSON.stringify(Object.fromEntries(new URLSearchParams(args.rawBody)))]
    );

    const itemsRes = await client.query<{ artwork_id: string }>('select artwork_id from order_items where order_id = $1', [
      args.orderId,
    ]);
    for (const item of itemsRes.rows) {
      await client.query(`update artworks set availability_status = 'sold' where id = $1`, [item.artwork_id]);
    }

    await client.query(`update inventory_reservations set status = 'completed' where order_id = $1 and status = 'active'`, [
      args.orderId,
    ]);

    await client.query(`update orders set status = 'sold', payfast_pf_payment_id = $1 where id = $2`, [
      args.pfPaymentId,
      args.orderId,
    ]);
  });
}
