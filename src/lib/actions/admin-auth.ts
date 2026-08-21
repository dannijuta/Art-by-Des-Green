'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { verifyAdminCredentials, createAdminSession, destroyAdminSession } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { adminLoginSchema } from '@/lib/validation';

export interface AdminLoginState {
  status: 'idle' | 'error';
  message?: string;
}

export async function adminLogin(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: 'error', message: 'Please enter a valid email and password.' };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const allowed = await checkRateLimit('admin-login', ip, { maxAttempts: 10, windowMinutes: 15 });
  if (!allowed) {
    return { status: 'error', message: 'Too many login attempts. Please try again later.' };
  }

  const user = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { status: 'error', message: 'Incorrect email or password.' };
  }

  await createAdminSession(user);
  redirect('/admin');
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect('/admin/login');
}
