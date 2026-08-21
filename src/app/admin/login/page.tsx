'use client';

import { useActionState } from 'react';
import { adminLogin, type AdminLoginState } from '@/lib/actions/admin-auth';
import { FormField, TextInput } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: AdminLoginState = { status: 'idle' };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-2xl italic text-clay-dark">Art by Des</p>
        <h1 className="mt-6 text-center font-serif text-2xl text-charcoal">Admin Sign In</h1>

        <form action={formAction} className="mt-8 space-y-5" noValidate>
          <FormField label="Email" htmlFor="admin-email">
            <TextInput id="admin-email" name="email" type="email" required autoComplete="username" />
          </FormField>
          <FormField label="Password" htmlFor="admin-password">
            <TextInput id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </FormField>

          {state.status === 'error' && state.message && (
            <p role="alert" className="text-sm text-burgundy">
              {state.message}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
