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

export const metadata = { title: 'Admin — Commission Enquiries' };

interface CommissionRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_contact_method: string | null;
  subject: string;
  preferred_dimensions: string | null;
  budget_range: string | null;
  desired_completion_date: string | null;
  additional_info: string | null;
  status: string;
  created_at: string;
}

async function setStatus(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  await query('update commission_enquiries set status = $1 where id = $2', [status, id]);
  revalidatePath('/admin/commissions');
}

export default async function AdminCommissionsPage() {
  const { rows } = await query<CommissionRow>('select * from commission_enquiries order by created_at desc');

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Commission Enquiries ({rows.length})</h1>

      <div className="mt-6 space-y-4">
        {rows.map((c) => (
          <div key={c.id} className="border border-border-soft bg-cream p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-charcoal">
                  {c.name} <span className="text-charcoal-soft">— {c.email}</span>
                </p>
                <p className="text-xs text-charcoal-soft">
                  {new Date(c.created_at).toLocaleString('en-ZA')}
                  {c.phone ? ` · ${c.phone}` : ''}
                  {c.preferred_contact_method ? ` · prefers ${c.preferred_contact_method}` : ''}
                </p>
              </div>
              <StatusSelect id={c.id} status={c.status} action={setStatus} options={STATUS_OPTIONS} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-charcoal-soft">{c.subject}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-charcoal-soft sm:grid-cols-3">
              {c.preferred_dimensions && (
                <div>
                  <dt className="inline">Dimensions: </dt>
                  <dd className="inline text-charcoal">{c.preferred_dimensions}</dd>
                </div>
              )}
              {c.budget_range && (
                <div>
                  <dt className="inline">Budget: </dt>
                  <dd className="inline text-charcoal">{c.budget_range}</dd>
                </div>
              )}
              {c.desired_completion_date && (
                <div>
                  <dt className="inline">Completion: </dt>
                  <dd className="inline text-charcoal">{c.desired_completion_date}</dd>
                </div>
              )}
            </dl>
            {c.additional_info && <p className="mt-2 whitespace-pre-wrap text-xs text-charcoal-soft">{c.additional_info}</p>}
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-charcoal-soft">No commission enquiries yet.</p>}
      </div>
    </div>
  );
}
