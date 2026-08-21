import 'server-only';
import { query } from '@/lib/db';
import type {
  ArtistProfileSettings,
  ContactSettings,
  HomepageCopySettings,
  ShippingSettings,
  PoliciesSettings,
  SeoSettings,
} from '@/types/domain';

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { rows } = await query<{ value: T }>('select value from settings where key = $1', [key]);
    return rows[0]?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await query(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}

const FALLBACK_ARTIST: ArtistProfileSettings = {
  name: 'Des Green',
  professionalDescription: 'South African oil painter',
  basedIn: 'East London, South Africa',
  commissionsOpen: true,
  introLine: '',
  bioParagraphs: [],
  signatureName: 'Des Green',
  studioImagePath: '/images/studio/des-green-studio.png',
  studioImageAlt: 'Des Green working on a painting in her studio.',
};

const FALLBACK_CONTACT: ContactSettings = {
  phoneDisplay: '083 524 4713',
  phoneLink: 'tel:+27835244713',
  email: 'djuta68@gmail.com',
  emailLink: 'mailto:djuta68@gmail.com',
  facebookUrl: 'https://www.facebook.com/artbydesj',
  facebookLabel: 'Art by Des Green on Facebook',
  instagramUrl: 'https://www.instagram.com/artbydesj/',
  instagramHandle: '@artbydesj',
  instagramLabel: 'Art by Des Green on Instagram',
  location: 'East London, South Africa',
};

const FALLBACK_HOMEPAGE: HomepageCopySettings = {
  eyebrow: 'Original art by South African artist Des Green',
  headline: 'Paintings with presence, story and soul.',
  supportingCopy:
    'Explore a collection shaped by colour, character, atmosphere and observation — from African wildlife and portraiture to coastal scenes, cityscapes and still life.',
  primaryCtaLabel: 'Explore the Collection',
  primaryCtaHref: '/gallery',
  secondaryCtaLabel: 'View Available Works',
  secondaryCtaHref: '/available-works',
  commissionsCtaLabel: 'Commission an Artwork',
  commissionsCtaHref: '/commissions',
};

const FALLBACK_SHIPPING: ShippingSettings = {
  defaultMethod: 'quote_required',
  flatRateCents: null,
  collectionNote: null,
  reservationMinutes: 30,
  quoteApprovedReservationMinutes: 4320,
};

const FALLBACK_POLICIES: PoliciesSettings = {
  needsCompletion: true,
  privacyPolicy: '',
  terms: '',
  shippingCollection: '',
  returnsRefunds: '',
  copyright: '© Art by Des Green. All artwork and images remain the property of the artist. All rights reserved.',
};

const FALLBACK_SEO: SeoSettings = {
  siteName: 'Art by Des Green',
  defaultTitle: 'Art by Des Green | Original South African Oil Paintings',
  defaultDescription: 'Original oil paintings by South African artist Des Green.',
};

export const getArtistProfile = () => getSetting('public.artist_profile', FALLBACK_ARTIST);
export const getContactSettings = () => getSetting('public.contact', FALLBACK_CONTACT);
export const getHomepageCopy = () => getSetting('public.homepage_copy', FALLBACK_HOMEPAGE);
export const getShippingSettings = () => getSetting('public.shipping_settings', FALLBACK_SHIPPING);
export const getPolicies = () => getSetting('public.policies', FALLBACK_POLICIES);
export const getSeoSettings = () => getSetting('public.seo', FALLBACK_SEO);
