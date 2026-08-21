import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { StatusSelect } from '@/components/admin/status-select';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

export const metadata = { title: 'Admin — Enquiries' };

interface EnquiryRow {
  id: string;
  reason: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  artwork_title: string | null;
}

async function setStatus(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  await query('update enquiries set status = $1 where id = $2', [status, id]);
  revalidatePath('/admin/enquiries');
}

export default async function AdminEnquiriesPage() {
  const { rows } = await query<EnquiryRow>(`
    select e.id, e.reason, e.name, e.email, e.phone, e.message, e.status, e.created_at, a.public_title as artwork_title
    from enquiries e
    left join artworks a on a.id = e.artwork_id
    order by e.created_at desc
  `);

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Enquiries ({rows.length})</h1>

      <div className="mt-6 space-y-4">
        {rows.map((e) => (
          <div key={e.id} className="border border-border-soft bg-cream p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-charcoal">
                  {e.name} <span className="text-charcoal-soft">— {e.email}</span>
                </p>
                <p className="text-xs text-charcoal-soft">
                  {new Date(e.created_at).toLocaleString('en-ZA')} · {e.reason}
                  {e.phone ? ` · ${e.phone}` : ''}
                  {e.artwork_title ? ` · Re: ${e.artwork_title}` : ''}
                </p>
              </div>
              <StatusSelect id={e.id} status={e.status} action={setStatus} options={STATUS_OPTIONS} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-charcoal-soft">{e.message}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-charcoal-soft">No enquiries yet.</p>}
      </div>
    </div>
  );
}
