import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  CANONICAL_SITE_URL,
  FACEBOOK_URL,
  GOOGLE_REVIEW_URL,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PUBLIC_LOCATION,
  buildLocalBusinessJsonLd,
  formatPhoneDisplay,
  publicFacebookUrl,
  publicInstagramHandle,
  publicInstagramUrl,
  serializeJsonLd,
} from '../src/lib/local-business.ts';
import { DEFAULT_GA_MEASUREMENT_ID, googleAnalyticsId } from '../src/lib/google-analytics.ts';
import { assessSubmitTiming, MIN_CONTACT_SUBMIT_MS } from '../src/lib/form-spam.ts';

test('homepage title and description name the studio location', () => {
  assert.equal(HOMEPAGE_TITLE, 'Art by Des Green | Original Oil Paintings, East London, Eastern Cape');
  assert.match(HOMEPAGE_DESCRIPTION, /East London \(Gonubie\), Eastern Cape/);
  assert.match(PUBLIC_LOCATION, /East London \(Gonubie\), Eastern Cape/);
});

test('formatPhoneDisplay uses one international format for the studio number', () => {
  assert.equal(formatPhoneDisplay('083 524 4713'), BUSINESS_PHONE_DISPLAY);
  assert.equal(formatPhoneDisplay('tel:+27835244713'), BUSINESS_PHONE_DISPLAY);
  assert.equal(formatPhoneDisplay('+27 83 524 4713'), '+27 83 524 4713');
  assert.equal(formatPhoneDisplay(''), '+27 83 524 4713');
});

test('JSON-LD describes an ArtGallery with no street address', () => {
  const data = buildLocalBusinessJsonLd({
    founderName: 'Des Green',
    founderDescription: 'South African oil painter',
    email: 'djuta68@gmail.com',
    telephone: '083 524 4713',
    description: HOMEPAGE_DESCRIPTION,
  });

  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'ArtGallery');
  assert.equal(data.name, BUSINESS_NAME);
  assert.equal(data.url, CANONICAL_SITE_URL);
  assert.equal(data.telephone, '+27 83 524 4713');
  assert.equal(data.address.addressLocality, 'Gonubie, East London');
  assert.equal(data.address.addressRegion, 'Eastern Cape');
  assert.equal(data.address.addressCountry, 'ZA');
  assert.equal('streetAddress' in data.address, false);
  assert.deepEqual(
    data.areaServed.map((area) => area.name),
    ['East London', 'Gonubie', 'Eastern Cape']
  );
  assert.equal(data.founder['@type'], 'Person');
  assert.equal(data.founder.name, 'Des Green');
  assert.equal(INSTAGRAM_URL, 'https://www.instagram.com/artbydesg/');
  assert.equal(INSTAGRAM_HANDLE, '@artbydesg');
  assert.equal(publicInstagramUrl('https://www.instagram.com/artbydesj/'), INSTAGRAM_URL);
  assert.equal(publicInstagramHandle('@artbydesj'), INSTAGRAM_HANDLE);
  assert.equal(FACEBOOK_URL, 'https://www.facebook.com/artbydesg');
  assert.equal(publicFacebookUrl('https://www.facebook.com/artbydesj'), FACEBOOK_URL);
  assert.equal(publicFacebookUrl('https://www.facebook.com/artbydesj/'), 'https://www.facebook.com/artbydesg/');
  assert.equal(publicFacebookUrl(''), FACEBOOK_URL);
  assert.equal(data.sameAs.some((url) => url.includes('artbydesj')), false);
  assert.deepEqual(data.sameAs, [FACEBOOK_URL, INSTAGRAM_URL, GOOGLE_REVIEW_URL]);

  const parsed = JSON.parse(serializeJsonLd(data));
  assert.equal(parsed.name, 'Art By Des Green');
  assert.equal(parsed.url, 'https://artbydesgreen.co.za');
});

test('GA4 uses the built-in measurement ID unless a valid override is set', () => {
  const previous = process.env.NEXT_PUBLIC_GA_ID;
  try {
    delete process.env.NEXT_PUBLIC_GA_ID;
    assert.equal(DEFAULT_GA_MEASUREMENT_ID, 'G-T5YNPYRKC6');
    assert.equal(googleAnalyticsId(), 'G-T5YNPYRKC6');
    assert.equal(googleAnalyticsId(''), 'G-T5YNPYRKC6');
    assert.equal(googleAnalyticsId('   '), 'G-T5YNPYRKC6');
    assert.equal(googleAnalyticsId('not-an-id'), 'G-T5YNPYRKC6');
    assert.equal(googleAnalyticsId('G-AB12CD34'), 'G-AB12CD34');

    process.env.NEXT_PUBLIC_GA_ID = 'G-OVERRIDE1';
    assert.equal(googleAnalyticsId(), 'G-OVERRIDE1');
    process.env.NEXT_PUBLIC_GA_ID = 'not-an-id';
    assert.equal(googleAnalyticsId(), 'G-T5YNPYRKC6');
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_GA_ID;
    else process.env.NEXT_PUBLIC_GA_ID = previous;
  }
});

test('contact form timing rejects instant, missing, and stale timestamps', () => {
  const now = 1_700_000_000_000;
  assert.equal(assessSubmitTiming(String(now - 500), now), 'too_fast');
  assert.equal(assessSubmitTiming(String(now - (MIN_CONTACT_SUBMIT_MS - 1)), now), 'too_fast');
  assert.equal(assessSubmitTiming(String(now - MIN_CONTACT_SUBMIT_MS), now), 'ok');
  assert.equal(assessSubmitTiming('', now), 'invalid');
  assert.equal(assessSubmitTiming('not-a-time', now), 'invalid');
  assert.equal(assessSubmitTiming(String(now + 60_000), now), 'invalid');
  assert.equal(assessSubmitTiming(String(now - 25 * 60 * 60 * 1000), now), 'invalid');
});
