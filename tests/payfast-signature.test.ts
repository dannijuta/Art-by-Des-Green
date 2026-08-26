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

test('toParamString with keepEmpty=true includes blank fields (real ITN bodies always send custom_str1-5/custom_int1-5 blank)', () => {
  const pairs: Array<[string, string]> = [
    ['merchant_id', '10000100'],
    ['amount_gross', '500.00'],
    ['custom_str1', ''],
    ['custom_str2', ''],
    ['name_first', 'Test'],
  ];
  const str = toParamString(pairs, 'jt7NOE43FZPn', true);
  assert.equal(
    str,
    'merchant_id=10000100&amount_gross=500.00&custom_str1=&custom_str2=&name_first=Test&passphrase=jt7NOE43FZPn'
  );
});

test('regression: validating a real PayFast ITN requires keepEmpty=true, or a genuine payment is wrongly rejected', () => {
  // Captured verbatim from a real live PayFast transaction (order
  // ADG-20260826-8314, R500.00) that was incorrectly rejected as
  // "signature_mismatch" before this fix, because custom_str1-5/custom_int1-5
  // were present-but-blank in the notification and PayFast's own signature
  // includes them, while our validation was stripping blanks before
  // recomputing the signature.
  const rawBody =
    'm_payment_id=ADG-20260826-8314&pf_payment_id=323621605&payment_status=COMPLETE&item_name=Gulls+Above+the+Crashing+Surf&item_description=Original+painting+%E2%80%94+order+ADG-20260826-8314&amount_gross=500.00&amount_fee=-20.70&amount_net=479.30&custom_str1=&custom_str2=&custom_str3=&custom_str4=&custom_str5=&custom_int1=&custom_int2=&custom_int3=&custom_int4=&custom_int5=&name_first=Danielle&name_last=Juta&email_address=xxdaniellejutaxx%40gmail.com&merchant_id=15307862&signature=8d214cc1d19b2b03f09f01043fb5f628';
  const receivedSignature = '8d214cc1d19b2b03f09f01043fb5f628';
  const passphrase = '3aTs0m3Cak3yay';

  const entries = [...new URLSearchParams(rawBody).entries()];
  const beforeSignature: Array<[string, string]> = [];
  for (const [k, v] of entries) {
    if (k === 'signature') break;
    beforeSignature.push([k, v]);
  }

  const correct = md5(toParamString(beforeSignature, passphrase, true));
  assert.equal(correct, receivedSignature, 'keepEmpty=true must reproduce PayFast’s real signature');

  const buggy = md5(toParamString(beforeSignature, passphrase, false));
  assert.notEqual(buggy, receivedSignature, 'keepEmpty=false is the bug this test guards against — it must NOT match');
});

test('isKnownPayfastIp recognises documented PayFast ranges', () => {
  assert.equal(isKnownPayfastIp('197.97.145.150'), true); // inside 197.97.145.144/28
  assert.equal(isKnownPayfastIp('144.126.193.139'), true); // exact single IP
  assert.equal(isKnownPayfastIp('8.8.8.8'), false);
});
