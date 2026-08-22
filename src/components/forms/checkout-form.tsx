'use client';

import { useActionState, useState } from 'react';
import { startCheckout, type CheckoutFormState } from '@/lib/actions/checkout';
import { FormField, TextInput } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import type { ShippingMethod } from '@/types/domain';

const initialState: CheckoutFormState = { status: 'idle' };

export function CheckoutForm({
  artworkId,
  shippingMethod,
  payfastLive,
}: {
  artworkId: string;
  shippingMethod: ShippingMethod;
  payfastLive: boolean;
}) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);
  const needsAddress = shippingMethod === 'flat_rate' || shippingMethod === 'quote_required';
  const [country, setCountry] = useState('South Africa');

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="artworkId" value={artworkId} />

      <div className="hidden" aria-hidden="true">
        <label htmlFor="co-website">Leave this field empty</label>
        <input id="co-website" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="co-name" error={state.fieldErrors?.name}>
          <TextInput id="co-name" name="name" type="text" required autoComplete="name" />
        </FormField>
        <FormField label="Email" htmlFor="co-email" error={state.fieldErrors?.email}>
          <TextInput id="co-email" name="email" type="email" required autoComplete="email" />
        </FormField>
      </div>

      <FormField label="Telephone" htmlFor="co-phone" optional error={state.fieldErrors?.phone}>
        <TextInput id="co-phone" name="phone" type="tel" autoComplete="tel" />
      </FormField>

      {needsAddress && (
        <fieldset className="space-y-5 border border-border-soft p-5">
          <legend className="px-1 text-sm text-charcoal">Shipping address</legend>
          <FormField label="Address line 1" htmlFor="co-address1" error={state.fieldErrors?.addressLine1}>
            <TextInput id="co-address1" name="addressLine1" type="text" required autoComplete="address-line1" />
          </FormField>
          <FormField label="Address line 2" htmlFor="co-address2" optional error={state.fieldErrors?.addressLine2}>
            <TextInput id="co-address2" name="addressLine2" type="text" autoComplete="address-line2" />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="City" htmlFor="co-city" error={state.fieldErrors?.city}>
              <TextInput id="co-city" name="city" type="text" required autoComplete="address-level2" />
            </FormField>
            <FormField label="Postal code" htmlFor="co-postal" error={state.fieldErrors?.postalCode}>
              <TextInput id="co-postal" name="postalCode" type="text" required autoComplete="postal-code" />
            </FormField>
            <FormField label="Province" htmlFor="co-province" optional error={state.fieldErrors?.province}>
              <TextInput id="co-province" name="province" type="text" autoComplete="address-level1" />
            </FormField>
          </div>
          <FormField label="Country" htmlFor="co-country" error={state.fieldErrors?.country}>
            <TextInput
              id="co-country"
              name="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              autoComplete="country-name"
            />
          </FormField>
        </fieldset>
      )}

      <div className="flex items-start gap-3">
        <input id="co-consent" name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-clay" />
        <label htmlFor="co-consent" className="text-sm text-charcoal-soft">
          I agree to proceed with this{' '}
          {payfastLive ? 'purchase' : 'purchase request'} and understand this is a one-of-a-kind original artwork.
        </label>
      </div>
      {state.fieldErrors?.consent && (
        <p role="alert" className="text-xs text-burgundy">
          {state.fieldErrors.consent}
        </p>
      )}

      {state.status === 'error' && state.message && (
        <p role="alert" className="border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? 'Reserving…'
          : shippingMethod === 'quote_required'
            ? 'Request Shipping Quote'
            : payfastLive
              ? 'Continue to Payment'
              : 'Request to Purchase'}
      </Button>
    </form>
  );
}
