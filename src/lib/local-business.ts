/**
 * Public identity for Art by Des Green. These values are rendered in the
 * homepage metadata and JSON-LD directly, so the live site does not wait on
 * a settings-table migration before search engines see them.
 */

export const CANONICAL_SITE_URL = 'https://artbydesgreen.co.za';
export const BUSINESS_NAME = 'Art By Des Green';
export const BUSINESS_PHONE_DISPLAY = '+27 83 524 4713';
export const PUBLIC_LOCATION = 'East London (Gonubie), Eastern Cape';
export const GOOGLE_REVIEW_URL = 'https://g.page/r/CfoSYIj0T4dgEBI/review';
export const FACEBOOK_URL = 'https://www.facebook.com/artbydesj';
export const INSTAGRAM_URL = 'https://www.instagram.com/artbydesj/';

export const HOMEPAGE_TITLE = 'Art by Des Green | Original Oil Paintings, East London, Eastern Cape';
export const HOMEPAGE_DESCRIPTION =
  'Original oil paintings by South African artist Des Green, based in East London (Gonubie), Eastern Cape. Browse the collection, view available works and enquire about commissions.';

const STUDIO_PHONE_DIGITS = new Set(['27835244713', '0835244713', '835244713']);

/** Render the studio number as +27 83 524 4713 wherever it is shown or marked up. */
export function formatPhoneDisplay(phone?: string | null): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (STUDIO_PHONE_DIGITS.has(digits)) return BUSINESS_PHONE_DISPLAY;
  const trimmed = phone?.trim();
  return trimmed || BUSINESS_PHONE_DISPLAY;
}

export function buildLocalBusinessJsonLd(input: {
  founderName: string;
  founderDescription?: string;
  email?: string;
  telephone?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: BUSINESS_NAME,
    url: CANONICAL_SITE_URL,
    telephone: formatPhoneDisplay(input.telephone),
    ...(input.email ? { email: input.email } : {}),
    ...(input.description ? { description: input.description } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gonubie, East London',
      addressRegion: 'Eastern Cape',
      addressCountry: 'ZA',
    },
    areaServed: [
      { '@type': 'City', name: 'East London' },
      { '@type': 'Place', name: 'Gonubie' },
      { '@type': 'AdministrativeArea', name: 'Eastern Cape' },
    ],
    founder: {
      '@type': 'Person',
      name: input.founderName,
      jobTitle: 'Artist / Oil Painter',
      ...(input.founderDescription ? { description: input.founderDescription } : {}),
    },
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL, GOOGLE_REVIEW_URL],
  };
}

/** JSON-LD safe to drop into a script tag (escapes `<` so descriptions cannot close it). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
