import 'server-only';
import crypto from 'node:crypto';
import { query } from './db';

/** Hashes the IP so raw addresses are never persisted. */
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * DB-backed sliding-window rate limit (works across serverless instances,
 * unlike an in-memory counter). Returns true if the request should be allowed.
 */
export async function checkRateLimit(
  form: string,
  ip: string,
  { maxAttempts = 5, windowMinutes = 15 }: { maxAttempts?: number; windowMinutes?: number } = {}
): Promise<boolean> {
  const ipHash = hashIp(ip || 'unknown');
  const { rows } = await query<{ count: string }>(
    `select count(*) from form_submission_log
     where ip_hash = $1 and form = $2 and created_at > now() - ($3 || ' minutes')::interval`,
    [ipHash, form, windowMinutes]
  );
  const count = Number(rows[0]?.count ?? 0);
  if (count >= maxAttempts) return false;

  await query('insert into form_submission_log (ip_hash, form) values ($1, $2)', [ipHash, form]);
  return true;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}
