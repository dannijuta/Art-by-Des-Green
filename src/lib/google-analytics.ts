/** Live GA4 measurement ID. Used when NEXT_PUBLIC_GA_ID is unset or invalid. */
export const DEFAULT_GA_MEASUREMENT_ID = 'G-T5YNPYRKC6';

const MEASUREMENT_ID = /^G-[A-Z0-9]+$/i;

/**
 * Measurement ID for the gtag snippet. A valid NEXT_PUBLIC_GA_ID overrides the
 * built-in default. Blank and malformed values fall back to that default so a
 * bad env var cannot be interpolated into the script or turn the tag off.
 */
export function googleAnalyticsId(raw: string | undefined = process.env.NEXT_PUBLIC_GA_ID): string {
  const id = raw?.trim();
  if (id && MEASUREMENT_ID.test(id)) return id;
  return DEFAULT_GA_MEASUREMENT_ID;
}
