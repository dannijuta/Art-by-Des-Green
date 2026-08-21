'use client';

import { useActionState } from 'react';
import { submitContactForm, type ContactFormState } from '@/lib/actions/enquiries';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: ContactFormState = { status: 'idle' };

const REASONS = [
  { value: 'availability', label: 'Artwork availability' },
  { value: 'purchase', label: 'Purchase enquiry' },
  { value: 'commission', label: 'Commission' },
  { value: 'shipping', label: 'Shipping or collection' },
  { value: 'general', label: 'General enquiry' },
];

export function ContactForm({
  artworkId,
  artworkTitle,
  defaultReason = 'general',
}: {
  artworkId?: string;
  artworkTitle?: string;
  defaultReason?: string;
}) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === 'success') {
    return (
      <div role="status" className="border border-olive/40 bg-cream px-6 py-8 text-center">
        <p className="font-serif text-xl text-charcoal">Message sent</p>
        <p className="mt-2 text-sm text-charcoal-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {artworkTitle && (
        <p className="border border-border-soft bg-parchment px-4 py-3 text-sm text-charcoal-soft">
          Regarding: <span className="text-charcoal">{artworkTitle}</span>
        </p>
      )}
      {artworkId && <input type="hidden" name="artworkId" value={artworkId} />}

      {/* Honeypot: hidden from real visitors, invisible to screen readers, but bots that fill every field will trip it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <TextInput id="name" name="name" type="text" required autoComplete="name" />
        </FormField>
        <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <TextInput id="email" name="email" type="email" required autoComplete="email" />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Telephone" htmlFor="phone" optional error={state.fieldErrors?.phone}>
          <TextInput id="phone" name="phone" type="tel" autoComplete="tel" />
        </FormField>
        <FormField label="Reason for enquiry" htmlFor="reason" error={state.fieldErrors?.reason}>
          <Select id="reason" name="reason" required defaultValue={defaultReason}>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Message" htmlFor="message" error={state.fieldErrors?.message}>
        <TextArea id="message" name="message" rows={5} required />
      </FormField>

      <div className="flex items-start gap-3">
        <input id="consent" name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-clay" />
        <label htmlFor="consent" className="text-sm text-charcoal-soft">
          I agree that Art by Des Green may use these details to respond to my enquiry.
        </label>
      </div>
      {state.fieldErrors?.consent && (
        <p role="alert" className="text-xs text-burgundy">
          {state.fieldErrors.consent}
        </p>
      )}

      {state.status === 'error' && state.message && (
        <p role="alert" className="text-sm text-burgundy">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
