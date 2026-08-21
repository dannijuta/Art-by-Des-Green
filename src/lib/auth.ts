import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { query } from './db';

const SESSION_COOKIE = 'adg_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is not set (or too short). Generate one with `openssl rand -base64 32` and add it to .env.local.'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  adminId: string;
  email: string;
  name: string | null;
  role: 'admin' | 'owner';
}

interface AdminUserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: 'admin' | 'owner';
  session_version: number;
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUserRow | null> {
  const { rows } = await query<AdminUserRow>(
    'SELECT id, email, password_hash, name, role, session_version FROM admin_users WHERE lower(email) = lower($1)',
    [email]
  );
  const user = rows[0];
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

export async function createAdminSession(user: AdminUserRow): Promise<void> {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    sv: user.session_version,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  await query('UPDATE admin_users SET last_login_at = now() WHERE id = $1', [user.id]);
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const adminId = payload.sub;
    if (!adminId) return null;

    const { rows } = await query<{ session_version: number }>(
      'SELECT session_version FROM admin_users WHERE id = $1',
      [adminId]
    );
    const current = rows[0];
    if (!current || current.session_version !== payload.sv) {
      // Password changed or sessions revoked since this token was issued.
      return null;
    }

    return {
      adminId,
      email: payload.email as string,
      name: (payload.name as string) ?? null,
      role: payload.role as 'admin' | 'owner',
    };
  } catch {
    return null;
  }
}

/** Call at the top of every admin Server Action and admin API route. Throws if not authenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
