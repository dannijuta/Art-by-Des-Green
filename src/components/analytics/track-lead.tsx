'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/meta-pixel';

const FIRED_KEY_PREFIX = 'adg_lead_fired_';

/**
 * Fires Meta's Lead event once the purchase/shipping-quote request form has
 * been successfully submitted — i.e. on the confirmation page the customer
 * lands on right after submitting, never at the point they merely start
 * filling the form in (that's TrackInitiateCheckout, on the checkout page
 * itself) and never once a real payment has actually happened (that would be
 * a separate Purchase event, not built here).
 *
 * Guards against double-firing if the same confirmation page is refreshed or
 * revisited — sessionStorage, keyed per order, not a hard analytics
 * guarantee, but enough to avoid the obvious case.
 */
export function TrackLead({ orderId, orderNumber, totalCents }: { orderId: string; orderNumber: string; totalCents: number | null }) {
  useEffect(() => {
    const key = `${FIRED_KEY_PREFIX}${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage can throw in some private-browsing modes — fall
      // through and fire anyway rather than silently losing the event.
    }
    trackMetaEvent('Lead', {
      content_name: orderNumber,
      ...(totalCents !== null ? { value: totalCents / 100, currency: 'ZAR' } : {}),
    });
    // Fires once per order, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
