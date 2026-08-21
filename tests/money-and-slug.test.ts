import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatZAR, randToCents, centsToRandString } from '../src/lib/money.ts';
import { slugify, generateOrderNumber } from '../src/lib/slug.ts';

test('formatZAR renders whole rand with thousands separator, no decimals', () => {
  assert.equal(formatZAR(690000), 'R 6 900');
});

test('randToCents / centsToRandString round-trip', () => {
  assert.equal(randToCents(6900), 690000);
  assert.equal(centsToRandString(690000), '6900.00');
});

test('slugify handles apostrophes, spaces, and mixed case', () => {
  assert.equal(slugify("Fishermen of Paternoster: End od day"), 'fishermen-of-paternoster-end-od-day');
  assert.equal(slugify("The strength we carry"), 'the-strength-we-carry');
});

test('slugify never produces leading/trailing hyphens', () => {
  assert.equal(slugify('  --Leopard!!--  '), 'leopard');
});

test('generateOrderNumber produces the ADG-YYYYMMDD-#### shape', () => {
  const orderNumber = generateOrderNumber(new Date('2026-08-21T12:00:00Z'));
  assert.match(orderNumber, /^ADG-20260821-\d{4}$/);
});
