'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { checkoutFormSchema } from '@/lib/validation';
import { getShippingSettings } from '@/lib/data/settings';
import { createReservedOrder, releaseExpiredReservations } from '@/lib/data/orders';
import { generateOrderNumber } from '@/lib/slug';
import { sendEmail, escapeHtml } from '@/lib/email';
import type { Artwork } from '@/types/domain';

export interface CheckoutFormState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function startCheckout(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }
  if (parsed.data.honeypot) {
    return { status: 'error', message: 'Something went wrong. Please try again.' };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const allowed = await checkRateLimit('checkout', ip, { maxAttempts: 8, windowMinutes: 15 });
  if (!allowed) {
    return { status: 'error', message: 'Too many attempts. Please try again in a little while.' };
  }

  await releaseExpiredReservations();

  const { rows } = await query<{
    id: string;
    public_title: string;
    slug: string;
    price_cents: number | null;
    availability_status: string;
    publishing_status: string;
    shipping_method_override: Artwork['shippingMethodOverride'];
  }>(
    `select id, public_title, slug, price_cents, availability_status, publishing_status, shipping_method_override
     from artworks where id = $1`,
    [parsed.data.artworkId]
  );
  const artwork = rows[0];

  if (!artwork || artwork.publishing_status !== 'published' || artwork.price_cents === null) {
    return { status: 'error', message: 'This artwork is not currently available for purchase.' };
  }
  if (artwork.availability_status !== 'available') {
    return {
      status: 'error',
      message: 'This artwork is no longer available — it may have just been reserved or sold by another buyer.',
    };
  }

  const shippingSettings = await getShippingSettings();
  const method = artwork.shipping_method_override ?? shippingSettings.defaultMethod;

  const needsAddress = method === 'flat_rate' || method === 'quote_required';
  if (needsAddress) {
    const missing: Record<string, string> = {};
    if (!parsed.data.addressLine1) missing.addressLine1 = 'Please enter your address.';
    if (!parsed.data.city) missing.city = 'Please enter your city.';
    if (!parsed.data.postalCode) missing.postalCode = 'Please enter your postal code.';
    if (Object.keys(missing).length > 0) {
      return { status: 'error', message: 'Please complete your shipping address.', fieldErrors: missing };
    }
  }

  const shippingAddress = needsAddress
    ? {
        line1: parsed.data.addressLine1 || '',
        line2: parsed.data.addressLine2 || '',
        city: parsed.data.city || '',
        postalCode: parsed.data.postalCode || '',
        province: parsed.data.province || '',
        country: parsed.data.country || 'South Africa',
      }
    : null;

  let shippingCents: number | null = null;
  let totalCents: number | null = null;
  let status: 'reserved' | 'quote_required' = 'reserved';

  if (method === 'included' || method === 'collection') {
    shippingCents = 0;
    totalCents = artwork.price_cents;
  } else if (method === 'flat_rate') {
    shippingCents = shippingSettings.flatRateCents ?? 0;
    totalCents = artwork.price_cents + shippingCents;
  } else {
    status = 'quote_required';
  }

  const orderNumber = generateOrderNumber();

  const result = await createReservedOrder({
    artworkId: artwork.id,
    orderNumber,
    status,
    customerName: parsed.data.name,
    customerEmail: parsed.data.email,
    customerPhone: parsed.data.phone || null,
    shippingMethod: method,
    shippingAddress,
    artworkPriceCents: artwork.price_cents,
    shippingCents,
    totalCents,
    reservationMinutes:
      status === 'quote_required' ? shippingSettings.quoteApprovedReservationMinutes : shippingSettings.reservationMinutes,
  });

  if (!result.ok) {
    return {
      status: 'error',
      message:
        result.reason === 'already_reserved'
          ? 'This artwork was just reserved by another buyer. Please check the gallery for similar available works.'
          : 'This artwork is no longer available for purchase.',
    };
  }

  if (status === 'quote_required') {
    await query('insert into shipping_quote_requests (order_id, address) values ($1, $2)', [
      result.orderId,
      JSON.stringify(shippingAddress),
    ]);

    const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL;
    if (notifyTo) {
      await sendEmail({
        to: notifyTo,
        subject: `Shipping quote needed — order ${orderNumber}`,
        html: `
          <h2>New order awaiting a shipping quote</h2>
          <p><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
          <p><strong>Artwork:</strong> ${escapeHtml(artwork.public_title)}</p>
          <p><strong>Customer:</strong> ${escapeHtml(parsed.data.name)} — ${escapeHtml(parsed.data.email)}</p>
          <p><strong>Address:</strong> ${escapeHtml(JSON.stringify(shippingAddress))}</p>
          <p>Log into the admin dashboard to add a shipping cost and send the customer a payment link.</p>
        `,
      });
    }

    redirect(`/checkout/quote-requested/${result.orderId}`);
  }

  redirect(`/checkout/pay/${result.orderId}`);
}
