import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phpUrlEncode, toParamString, md5, isKnownPayfastIp } from '../src/lib/payments/payfast-signature.ts';

test('phpUrlEncode matches PHP urlencode() for spaces (becomes +)', () => {
  assert.equal(phpUrlEncode('John Doe'), 'John+Doe');
});

test('phpUrlEncode matches PHP urlencode() for @ and .', () => {
  assert.equal(phpUrlEncode('test@test.com'), 'test%40test.com');
});

test('phpUrlEncode matches PHP urlencode() for a full URL (encodes :// and /)', () => {
  assert.equal(
    phpUrlEncode('http://www.yourdomain.co.za/return.php'),
    'http%3A%2F%2Fwww.yourdomain.co.za%2Freturn.php'
  );
});

test('phpUrlEncode escapes characters encodeURIComponent leaves alone but PHP does not', () => {
  // encodeURIComponent alone would leave ! ' ( ) * ~ untouched — PHP's urlencode does not.
  assert.equal(phpUrlEncode("O'Brien"), "O%27Brien");
  assert.equal(phpUrlEncode('(test)'), '%28test%29');
  assert.equal(phpUrlEncode('a*b~c!d'), 'a%2Ab%7Ec%21d');
});

test('phpUrlEncode leaves unreserved characters (- _ . alnum) untouched', () => {
  assert.equal(phpUrlEncode('Order-123_final.v2'), 'Order-123_final.v2');
});

test('toParamString concatenates in insertion order, skips blanks, appends passphrase last', () => {
  const pairs: Array<[string, string]> = [
    ['merchant_id', '10000100'],
    ['merchant_key', '46f0cd694581a'],
    ['amount', ''], // blank fields must be skipped entirely, not sent as amount=
    ['item_name', 'Order#123'],
  ];
  const str = toParamString(pairs, 'jt7NOE43FZPn');
  assert.equal(str, 'merchant_id=10000100&merchant_key=46f0cd694581a&item_name=Order%23123&passphrase=jt7NOE43FZPn');
});

test('signature is deterministic MD5 of the param string', () => {
  const str = 'merchant_id=10000100&merchant_key=46f0cd694581a&amount=10.00&item_name=Order%23123';
  assert.equal(md5(str), md5(str));
  assert.equal(md5(str).length, 32);
});

test('round trip: building a payment form then re-deriving the signature from its own field order matches', () => {
  // Simulates what happens when PayFast POSTs back the same fields (plus its own
  // response fields) in the ITN — the ordered-pairs-before-`signature` extraction
  // must reproduce the same signature the form was built with.
  const pairs: Array<[string, string]> = [
    ['merchant_id', '10000100'],
    ['merchant_key', '46f0cd694581a'],
    ['return_url', 'http://www.yourdomain.co.za/return.php'],
    ['cancel_url', 'http://www.yourdomain.co.za/cancel.php'],
    ['notify_url', 'http://www.yourdomain.co.za/notify.php'],
    ['name_first', 'First Name'],
    ['name_last', 'Last Name'],
    ['email_address', 'test@test.com'],
    ['m_payment_id', '1234'],
    ['amount', '10.00'],
    ['item_name', 'Order#123'],
  ];
  const passphrase = 'jt7NOE43FZPn';
  const signature = md5(toParamString(pairs, passphrase));

  // Simulate the field order as it would appear in an ITN body: same pairs,
  // then the signature field appended last (as PayFast's own example shows).
  const bodyPairs = [...pairs, ['signature', signature] as [string, string]];
  const rawBody = bodyPairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

  const entries = [...new URLSearchParams(rawBody).entries()];
  const beforeSignature: Array<[string, string]> = [];
  for (const [k, v] of entries) {
    if (k === 'signature') break;
    beforeSignature.push([k, v]);
  }
  const recomputed = md5(toParamString(beforeSignature, passphrase));
  assert.equal(recomputed, signature);
});

test('isKnownPayfastIp recognises documented PayFast ranges', () => {
  assert.equal(isKnownPayfastIp('197.97.145.150'), true); // inside 197.97.145.144/28
  assert.equal(isKnownPayfastIp('144.126.193.139'), true); // exact single IP
  assert.equal(isKnownPayfastIp('8.8.8.8'), false);
});
