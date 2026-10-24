/** How long a person must have the contact form open before it can be sent. */
export const MIN_CONTACT_SUBMIT_MS = 3_000;

/** Ignore timestamps older than a day so a stale tab cannot be replayed forever. */
export const MAX_CONTACT_SUBMIT_MS = 24 * 60 * 60 * 1000;

const FUTURE_SKEW_MS = 5_000;

export type SubmitTiming = 'ok' | 'too_fast' | 'invalid';

/** Clock time for a form render. Kept out of the page component so the stamp stays server-side. */
export function captureFormRenderedAt(): number {
  return Date.now();
}

/**
 * Lightweight time-to-submit check. `renderedAt` is the server clock when the
 * form HTML was produced, sent back as a hidden field. No third-party script.
 */
export function assessSubmitTiming(raw: unknown, now = Date.now()): SubmitTiming {
  const renderedAt = typeof raw === 'number' ? raw : Number(typeof raw === 'string' ? raw.trim() : NaN);
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return 'invalid';

  const elapsed = now - renderedAt;
  if (elapsed < -FUTURE_SKEW_MS || elapsed > MAX_CONTACT_SUBMIT_MS) return 'invalid';
  if (elapsed < MIN_CONTACT_SUBMIT_MS) return 'too_fast';
  return 'ok';
}
