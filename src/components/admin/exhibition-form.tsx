'use client';

import { useActionState } from 'react';
import type { Exhibition } from '@/lib/data/exhibitions';
import type { ExhibitionFormState } from '@/lib/actions/admin-exhibitions';
import { FormField, TextInput, TextArea } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: ExhibitionFormState = { status: 'idle' };

export function ExhibitionForm({
  exhibition,
  action,
}: {
  exhibition?: Exhibition;
  action: (prev: ExhibitionFormState, formData: FormData) => Promise<ExhibitionFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="max-w-3xl space-y-6">
      <FormField label="Exhibition title" htmlFor="title">
        <TextInput id="title" name="title" type="text" required defaultValue={exhibition?.title ?? ''} />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Venue" htmlFor="venue">
          <TextInput id="venue" name="venue" type="text" required defaultValue={exhibition?.venue ?? ''} />
        </FormField>
        <FormField label="Town" htmlFor="town">
          <TextInput id="town" name="town" type="text" required defaultValue={exhibition?.town ?? ''} />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="startDate">
          <TextInput id="startDate" name="startDate" type="date" required defaultValue={exhibition?.startDate ?? ''} />
        </FormField>
        <FormField label="End date (same as start for a one-day event)" htmlFor="endDate" optional>
          <TextInput id="endDate" name="endDate" type="date" defaultValue={exhibition?.endDate ?? ''} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" optional>
        <TextArea id="description" name="description" rows={4} defaultValue={exhibition?.description ?? ''} />
      </FormField>

      <FormField label="Link (event page, map or tickets)" htmlFor="linkUrl" optional>
        <TextInput id="linkUrl" name="linkUrl" type="url" placeholder="https://" defaultValue={exhibition?.linkUrl ?? ''} />
      </FormField>

      <FormField label={exhibition?.imagePath ? 'Replace image' : 'Image'} htmlFor="image" optional>
        {exhibition?.imagePath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={exhibition.imagePath} alt="" className="mb-3 h-32 w-auto bg-parchment object-contain" />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-charcoal-soft file:mr-4 file:border file:border-border file:bg-cream file:px-3 file:py-2 file:text-sm file:text-charcoal"
        />
        {exhibition?.imagePath && (
          <label className="mt-2 flex items-center gap-2 text-xs text-charcoal-soft">
            <input type="checkbox" name="removeImage" className="h-4 w-4 accent-clay" /> Remove current image
          </label>
        )}
      </FormField>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={exhibition ? exhibition.isPublished : true}
          className="h-4 w-4 accent-clay"
        />
        Show on the website
      </label>

      {state.status === 'error' && state.message && (
        <p role="alert" className="border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {state.message}
        </p>
      )}
      {state.status === 'saved' && state.message && !pending && (
        <p role="status" className="border border-border-soft bg-parchment px-4 py-3 text-sm text-charcoal">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save Exhibition'}
      </Button>
    </form>
  );
}
