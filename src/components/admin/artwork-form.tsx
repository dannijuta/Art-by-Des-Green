'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import type { ArtworkAdmin, Category } from '@/types/domain';
import type { ArtworkFormState } from '@/lib/actions/admin-artworks';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { centsToRandString } from '@/lib/money';
import { artworkThumbPath } from '@/lib/image-paths';

const initialState: ArtworkFormState = { status: 'idle' };

export function ArtworkForm({
  artwork,
  categories,
  action,
}: {
  artwork?: ArtworkAdmin;
  categories: Category[];
  action: (prev: ArtworkFormState, formData: FormData) => Promise<ArtworkFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="max-w-3xl space-y-6">
      {artwork?.internalSellingNote && (
        <div className="border border-border-soft bg-parchment px-4 py-3 text-xs text-charcoal-soft">
          <strong>Internal note (never shown publicly):</strong> {artwork.internalSellingNote}
        </div>
      )}

      <FormField label="Public title" htmlFor="publicTitle" error={state.fieldErrors?.publicTitle}>
        <TextInput id="publicTitle" name="publicTitle" type="text" required defaultValue={artwork?.publicTitle} />
      </FormField>

      <FormField label="Working description" htmlFor="workingDescription" optional>
        <TextInput
          id="workingDescription"
          name="workingDescription"
          type="text"
          defaultValue={artwork?.workingDescription ?? ''}
        />
      </FormField>

      <FormField label="Public description" htmlFor="publicDescription" optional>
        <TextArea id="publicDescription" name="publicDescription" rows={4} defaultValue={artwork?.publicDescription ?? ''} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Category" htmlFor="categoryId" optional>
          <Select id="categoryId" name="categoryId" defaultValue={artwork?.category?.id ?? ''}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Price (ZAR)" htmlFor="priceRand" optional>
          <TextInput
            id="priceRand"
            name="priceRand"
            type="number"
            step="0.01"
            min="0"
            defaultValue={artwork?.priceCents !== null && artwork?.priceCents !== undefined ? centsToRandString(artwork.priceCents) : ''}
            placeholder="Leave blank if no price yet"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <FormField label="Width (cm)" htmlFor="widthCm" optional>
          <TextInput id="widthCm" name="widthCm" type="number" step="0.1" min="0" defaultValue={artwork?.widthCm ?? ''} />
        </FormField>
        <FormField label="Height (cm)" htmlFor="heightCm" optional>
          <TextInput id="heightCm" name="heightCm" type="number" step="0.1" min="0" defaultValue={artwork?.heightCm ?? ''} />
        </FormField>
        <FormField label="Medium" htmlFor="medium" optional>
          <TextInput id="medium" name="medium" type="text" defaultValue={artwork?.medium ?? ''} />
        </FormField>
        <FormField label="Surface" htmlFor="surface" optional>
          <TextInput id="surface" name="surface" type="text" defaultValue={artwork?.surface ?? ''} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Framed?" htmlFor="framed" optional>
          <Select id="framed" name="framed" defaultValue={artwork?.framed === true ? 'yes' : artwork?.framed === false ? 'no' : 'unknown'}>
            <option value="unknown">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </FormField>
        <FormField label="Shipping override" htmlFor="shippingMethodOverride" optional>
          <Select id="shippingMethodOverride" name="shippingMethodOverride" defaultValue={artwork?.shippingMethodOverride ?? ''}>
            <option value="">Use site default</option>
            <option value="included">Shipping included</option>
            <option value="flat_rate">Flat-rate shipping</option>
            <option value="collection">Collection only</option>
            <option value="quote_required">Shipping quote required</option>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Availability" htmlFor="availabilityStatus">
          <Select id="availabilityStatus" name="availabilityStatus" required defaultValue={artwork?.availabilityStatus ?? 'draft'}>
            <option value="draft">Draft (not shown on site)</option>
            <option value="gallery_only">Gallery only (not for sale)</option>
            <option value="available">Available for purchase</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </Select>
        </FormField>
        <FormField label="Publishing" htmlFor="publishingStatus">
          <Select id="publishingStatus" name="publishingStatus" required defaultValue={artwork?.publishingStatus ?? 'draft'}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (visible on site)</option>
            <option value="archived">Archived</option>
          </Select>
        </FormField>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" name="isFeatured" defaultChecked={artwork?.isFeatured} className="h-4 w-4 accent-clay" />
          Feature on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" name="isHero" defaultChecked={artwork?.isHero} className="h-4 w-4 accent-clay" />
          Use as homepage hero
        </label>
      </div>

      <FormField label="Alt text" htmlFor="altText" optional>
        <TextInput id="altText" name="altText" type="text" defaultValue={artwork?.altText ?? ''} />
      </FormField>

      <FormField
        label={artwork ? 'Replace image' : 'Image'}
        htmlFor="image"
        optional={Boolean(artwork)}
        error={state.fieldErrors?.image}
      >
        {artwork?.primaryImagePath && (
          <div className="relative mb-3 h-32 w-32 overflow-hidden bg-parchment">
            <Image
              src={artworkThumbPath(artwork.primaryImagePath)}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!artwork}
          className="block w-full text-sm text-charcoal-soft file:mr-4 file:border file:border-border file:bg-cream file:px-3 file:py-2 file:text-sm file:text-charcoal"
        />
        {!artwork && (
          <p className="mt-1.5 text-xs text-charcoal-soft">A photo is required when adding a new artwork.</p>
        )}
      </FormField>

      {state.status === 'error' && state.message && (
        <p role="alert" className="border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save Artwork'}
      </Button>
    </form>
  );
}
