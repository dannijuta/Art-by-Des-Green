'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { setSetting } from '@/lib/data/settings';
import { uploadArtworkImage } from '@/lib/storage';
import { randToCents } from '@/lib/money';

export async function updateArtistProfile(formData: FormData) {
  await requireAdmin();

  let studioImagePath: string | null = String(formData.get('existingStudioImagePath') || '') || null;
  const file = formData.get('studioImage');
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadArtworkImage(file);
    if (uploaded) studioImagePath = uploaded.publicUrl;
  }

  const bioParagraphs = String(formData.get('bioParagraphs') || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  await setSetting('public.artist_profile', {
    name: String(formData.get('name') || ''),
    professionalDescription: String(formData.get('professionalDescription') || ''),
    basedIn: String(formData.get('basedIn') || ''),
    commissionsOpen: formData.get('commissionsOpen') === 'on',
    introLine: String(formData.get('introLine') || ''),
    bioParagraphs,
    signatureName: String(formData.get('signatureName') || ''),
    studioImagePath,
    studioImageAlt: String(formData.get('studioImageAlt') || 'Des Green working on a painting in her studio.'),
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}

export async function updateContactSettings(formData: FormData) {
  await requireAdmin();
  await setSetting('public.contact', {
    phoneDisplay: String(formData.get('phoneDisplay') || ''),
    phoneLink: String(formData.get('phoneLink') || ''),
    email: String(formData.get('email') || ''),
    emailLink: String(formData.get('emailLink') || ''),
    facebookUrl: String(formData.get('facebookUrl') || ''),
    facebookLabel: String(formData.get('facebookLabel') || 'Art by Des Green on Facebook'),
    instagramUrl: String(formData.get('instagramUrl') || ''),
    instagramHandle: String(formData.get('instagramHandle') || ''),
    instagramLabel: String(formData.get('instagramLabel') || 'Art by Des Green on Instagram'),
    location: String(formData.get('location') || ''),
  });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}

export async function updateShippingSettings(formData: FormData) {
  await requireAdmin();
  const flatRateRand = String(formData.get('flatRateRand') || '').trim();
  await setSetting('public.shipping_settings', {
    defaultMethod: String(formData.get('defaultMethod') || 'quote_required'),
    flatRateCents: flatRateRand ? randToCents(Number.parseFloat(flatRateRand)) : null,
    collectionNote: String(formData.get('collectionNote') || '') || null,
    reservationMinutes: Number(formData.get('reservationMinutes') || 30),
    quoteApprovedReservationMinutes: Number(formData.get('quoteApprovedReservationMinutes') || 4320),
  });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}

export async function updateHomepageCopy(formData: FormData) {
  await requireAdmin();
  await setSetting('public.homepage_copy', {
    eyebrow: String(formData.get('eyebrow') || ''),
    headline: String(formData.get('headline') || ''),
    supportingCopy: String(formData.get('supportingCopy') || ''),
    primaryCtaLabel: String(formData.get('primaryCtaLabel') || ''),
    primaryCtaHref: String(formData.get('primaryCtaHref') || '/gallery'),
    secondaryCtaLabel: String(formData.get('secondaryCtaLabel') || ''),
    secondaryCtaHref: String(formData.get('secondaryCtaHref') || '/available-works'),
    commissionsCtaLabel: String(formData.get('commissionsCtaLabel') || 'Commission an Artwork'),
    commissionsCtaHref: String(formData.get('commissionsCtaHref') || '/commissions'),
  });
  revalidatePath('/');
  revalidatePath('/admin/settings');
}

export async function updatePolicies(formData: FormData) {
  await requireAdmin();
  await setSetting('public.policies', {
    needsCompletion: formData.get('needsCompletion') === 'on',
    privacyPolicy: String(formData.get('privacyPolicy') || ''),
    terms: String(formData.get('terms') || ''),
    shippingCollection: String(formData.get('shippingCollection') || ''),
    returnsRefunds: String(formData.get('returnsRefunds') || ''),
    copyright: String(formData.get('copyright') || ''),
    lastUpdated: String(formData.get('lastUpdated') || ''),
  });
  revalidatePath('/legal', 'layout');
  revalidatePath('/admin/settings');
}
