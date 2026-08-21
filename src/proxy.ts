import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'adg_admin_session';

// Coarse-grained gate: redirects obviously unauthenticated requests away from
// /admin before they render. This is a fast, DB-free check (valid signature +
// not expired) — it is not the authority on access. Every admin Server Action
// and admin page still calls requireAdmin(), which also checks the
// session_version against the database, so a revoked session is rejected even
// if the cookie itself is still validly signed. See src/lib/auth.ts.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secretString = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secretString) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secretString));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
