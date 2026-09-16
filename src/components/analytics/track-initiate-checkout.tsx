'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/meta-pixel';

/**
 * Fires Meta's InitiateCheckout event once, when the checkout/purchase-request
 * page has loaded — i.e. the moment someone begins the Request to Purchase /
 * shipping-quote process, before they've submitted anything. Renders nothing.
 */
export function TrackInitiateCheckout({
  artworkId,
  title,
  priceCents,
}: {
  artworkId: string;
  title: string;
  priceCents: number;
}) {
  useEffect(() => {
    trackMetaEvent('InitiateCheckout', {
      content_ids: [artworkId],
      content_type: 'product',
      content_name: title,
      value: priceCents / 100,
      currency: 'ZAR',
      num_items: 1,
    });
    // Fires once per page load (keyed on artworkId), not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  return null;
}
