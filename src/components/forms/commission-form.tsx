'use client';

import { useActionState } from 'react';
import { submitCommissionForm, type CommissionFormState } from '@/lib/actions/commissions';
import { FormField, TextInput, TextArea } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: CommissionFormState = { status: 'idle' };

export function CommissionForm() {
  const [state, formAction, pending] = useActionState(submitCommissionForm, initialState);

  if (state.status === 'success') {
    return (
      <div role="status" className="border border-olive/40 bg-cream px-6 py-8 text-center">
        <p className="font-serif text-xl text-charcoal">Enquiry sent</p>
        <p className="mt-2 text-sm text-charcoal-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate encType="multipart/form-data" className="space-y-5">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-website">Leave this field empty</label>
        <input id="cf-website" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="cf-name" error={state.fieldErrors?.name}>
          <TextInput id="cf-name" name="name" type="text" required autoComplete="name" />
        </FormField>
        <FormField label="Email" htmlFor="cf-email" error={state.fieldErrors?.email}>
          <TextInput id="cf-email" name="email" type="email" required autoComplete="email" />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Telephone" htmlFor="cf-phone" optional error={state.fieldErrors?.phone}>
          <TextInput id="cf-phone" name="phone" type="tel" autoComplete="tel" />
        </FormField>
        <FormField
          label="Preferred contact method"
          htmlFor="cf-contact-method"
          optional
          error={state.fieldErrors?.preferredContactMethod}
        >
          <TextInput id="cf-contact-method" name="preferredContactMethod" type="text" placeholder="Email or phone" />
        </FormField>
      </div>

      <FormField label="Subject or idea" htmlFor="cf-subject" error={state.fieldErrors?.subject}>
        <TextArea
          id="cf-subject"
          name="subject"
          rows={4}
          required
          placeholder="Tell Des about the subject, memory or idea you have in mind."
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          label="Preferred dimensions"
          htmlFor="cf-dimensions"
          optional
          error={state.fieldErrors?.preferredDimensions}
        >
          <TextInput id="cf-dimensions" name="preferredDimensions" type="text" placeholder="e.g. 60 x 90 cm" />
        </FormField>
        <FormField label="Budget range" htmlFor="cf-budget" optional error={state.fieldErrors?.budgetRange}>
          <TextInput id="cf-budget" name="budgetRange" type="text" placeholder="e.g. R5,000 – R10,000" />
        </FormField>
        <FormField
          label="Desired completion date"
          htmlFor="cf-completion"
          optional
          error={state.fieldErrors?.desiredCompletionDate}
        >
          <TextInput id="cf-completion" name="desiredCompletionDate" type="text" placeholder="e.g. December 2026" />
        </FormField>
      </div>

      <FormField
        label="Reference image"
        htmlFor="cf-reference-image"
        optional
        error={state.fieldErrors?.referenceImage}
      >
        <input
          id="cf-reference-image"
          name="referenceImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-charcoal-soft file:mr-4 file:border file:border-border file:bg-cream file:px-3 file:py-2 file:text-sm file:text-charcoal"
        />
      </FormField>

      <FormField
        label="Additional information"
        htmlFor="cf-additional"
        optional
        error={state.fieldErrors?.additionalInfo}
      >
        <TextArea id="cf-additional" name="additionalInfo" rows={4} />
      </FormField>

      <div className="flex items-start gap-3">
        <input id="cf-consent" name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-clay" />
        <label htmlFor="cf-consent" className="text-sm text-charcoal-soft">
          I agree that Art by Des Green may use these details to respond to my commission enquiry.
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
        {pending ? 'Sending…' : 'Send Commission Enquiry'}
      </Button>
    </form>
  );
}
