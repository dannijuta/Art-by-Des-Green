/**
 * Meta Pixel is entirely optional and only activates once a real Pixel ID is
 * configured — matching the site's existing pattern for PayFast (see
 * payfast-live.ts): never claim tracking is active when it isn't actually
 * wired up to a real ad account.
 */
export function metaPixelId(): string | undefined {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined;
}

export function isMetaPixelConfigured(): boolean {
  return Boolean(metaPixelId());
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Pixel event client-side. Safe to call even before the base script
 * has finished loading (fbq queues calls internally) or when the Pixel isn't
 * configured at all (silently does nothing rather than throwing).
 */
export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, params);
}
