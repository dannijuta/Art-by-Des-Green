'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadArtworkImage } from '@/lib/storage';

export interface ExhibitionFormState {
  status: 'idle' | 'error' | 'saved';
  message?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(formData: FormData, key: string, max = 2000): string {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

async function saveExhibition(id: string | null, formData: FormData): Promise<ExhibitionFormState> {
  const session = await requireAdmin();

  const title = text(formData, 'title', 200);
  const venue = text(formData, 'venue', 200);
  const town = text(formData, 'town', 120);
  const startDate = text(formData, 'startDate', 10);
  const endDate = text(formData, 'endDate', 10) || startDate;
  const description = text(formData, 'description', 4000) || null;
  let linkUrl = text(formData, 'linkUrl', 500) || null;
  const isPublished = formData.get('isPublished') === 'on';

  if (!title || !venue || !town) return { status: 'error', message: 'Please fill in the title, venue and town.' };
  if (!DATE.test(startDate) || !DATE.test(endDate)) return { status: 'error', message: 'Please choose the start and end dates.' };
  if (endDate < startDate) return { status: 'error', message: 'The end date cannot be before the start date.' };
  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) linkUrl = `https://${linkUrl}`;

  let imagePath: string | null = null;
  const image = formData.get('image');
  if (image instanceof File && image.size > 0) {
    try {
      const uploaded = await uploadArtworkImage(image);
      if (!uploaded) return { status: 'error', message: 'Image storage is not configured.' };
      imagePath = uploaded.publicUrl;
    } catch (err) {
      return { status: 'error', message: err instanceof Error ? err.message : 'Image upload failed.' };
    }
  }
  const removeImage = formData.get('removeImage') === 'on';

  let savedId = id;
  if (id) {
    await query(
      `update exhibitions set title = $1, venue = $2, town = $3, start_date = $4, end_date = $5, description = $6,
        link_url = $7, is_published = $8,
        image_path = case when $9::text is not null then $9 when $10 then null else image_path end,
        updated_at = now()
      where id = $11`,
      [title, venue, town, startDate, endDate, description, linkUrl, isPublished, imagePath, removeImage, id]
    );
  } else {
    const { rows } = await query<{ id: string }>(
      `insert into exhibitions (title, venue, town, start_date, end_date, description, link_url, is_published, image_path)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
      [title, venue, town, startDate, endDate, description, linkUrl, isPublished, imagePath]
    );
    savedId = rows[0].id;
  }
  await query('insert into audit_log (actor_email, action, entity_type, entity_id) values ($1,$2,$3,$4)', [
    session.email,
    id ? 'update' : 'create',
    'exhibition',
    savedId,
  ]);

  revalidatePath('/exhibitions');
  revalidatePath('/admin/exhibitions');
  if (!id) redirect('/admin/exhibitions');
  return { status: 'saved', message: 'Saved. The change is now live on the website.' };
}

export async function createExhibitionAction(_prev: ExhibitionFormState, formData: FormData) {
  return saveExhibition(null, formData);
}

export async function updateExhibitionAction(id: string, _prev: ExhibitionFormState, formData: FormData) {
  return saveExhibition(id, formData);
}

export async function deleteExhibitionAction(id: string) {
  const session = await requireAdmin();
  await query('delete from exhibitions where id = $1', [id]);
  await query('insert into audit_log (actor_email, action, entity_type, entity_id) values ($1,$2,$3,$4)', [
    session.email,
    'delete',
    'exhibition',
    id,
  ]);
  revalidatePath('/exhibitions');
  redirect('/admin/exhibitions');
}
