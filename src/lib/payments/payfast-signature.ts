import crypto from 'node:crypto';

// PayFast's signature spec (https://developers.payfast.co.za) requires PHP's
// urlencode() behaviour exactly: unreserved chars are only A-Z a-z 0-9 - _ .
// (note: NOT ~ ! * ' ( ) — those, unlike encodeURIComponent's default, are
// percent-encoded), hex digits upper-case, and spaces become '+' rather than
// %20. Getting this wrong is the #1 cause of "signature mismatch" errors.
// This function has no server-only dependency so it can be unit tested directly.
export function phpUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .replace(/%20/g, '+');
}

/** Builds the exact `key=value&key=value...` string PayFast expects, preserving insertion order. */
export function toParamString(pairs: Array<[string, string]>, passphrase?: string): string {
  const parts = pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`);
  let str = parts.join('&');
  if (passphrase) {
    str += `&passphrase=${phpUrlEncode(passphrase.trim())}`;
  }
  return str;
}

export function md5(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function ipToLong(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/');
  const bits = Number(bitsStr);
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(range);
  if (ipLong === null || rangeLong === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipLong & mask) === (rangeLong & mask);
}

// Published PayFast server ranges (see developers.payfast.co.za "Ports and IP
// addresses"). This list can change on PayFast's side — treat this check as
// one layer of defence, not the sole gate; the signature check, the amount
// check, and the server-to-server confirmation call are the load-bearing checks.
export const VALID_PAYFAST_CIDRS = [
  '197.97.145.144/28',
  '41.74.179.192/27',
  '102.216.36.0/28',
  '102.216.36.128/28',
];
export const VALID_PAYFAST_SINGLE_IPS = ['144.126.193.139'];

export function isKnownPayfastIp(ip: string): boolean {
  if (VALID_PAYFAST_SINGLE_IPS.includes(ip)) return true;
  return VALID_PAYFAST_CIDRS.some((cidr) => ipInCidr(ip, cidr));
}
