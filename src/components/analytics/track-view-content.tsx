'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/meta-pixel';

/**
 * Fires Meta's ViewContent event once, when an individual artwork page has
 * loaded. Renders nothing — mount this alongside the real page content.
 */
export function TrackViewContent({
  artworkId,
  title,
  categoryName,
  priceCents,
}: {
  artworkId: string;
  title: string;
  categoryName?: string | null;
  priceCents: number | null;
}) {
  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_ids: [artworkId],
      content_type: 'product',
      content_name: title,
      content_category: categoryName ?? undefined,
      ...(priceCents !== null ? { value: priceCents / 100, currency: 'ZAR' } : {}),
    });
    // Fires once per page load (keyed on artworkId), not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  return null;
}
