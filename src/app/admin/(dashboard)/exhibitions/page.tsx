import Link from 'next/link';
import { listAllExhibitionsAdmin, formatExhibitionDates } from '@/lib/data/exhibitions';

export const metadata = { title: 'Admin — Exhibitions' };

export default async function AdminExhibitionsPage() {
  const exhibitions = await listAllExhibitionsAdmin();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-charcoal">Exhibitions ({exhibitions.length})</h1>
        <Link href="/admin/exhibitions/new" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
          + Add Exhibition
        </Link>
      </div>
      <p className="mt-2 max-w-xl text-sm text-charcoal-soft">
        Exhibitions appear on the public Exhibitions page. They move from &ldquo;Upcoming&rdquo; to &ldquo;Past&rdquo;
        automatically the day after their end date.
      </p>

      {exhibitions.length === 0 ? (
        <p className="mt-8 border border-dashed border-border px-6 py-12 text-center text-sm text-charcoal-soft">
          No exhibitions yet. Click &ldquo;Add Exhibition&rdquo; to list one.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border-soft bg-cream">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-border-soft text-xs text-charcoal-soft">
              <tr>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {exhibitions.map((ex) => (
                <tr key={ex.id} className="border-b border-border-soft last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal-soft">
                    {formatExhibitionDates(ex.startDate, ex.endDate)}
                  </td>
                  <td className="px-4 py-3 text-charcoal">{ex.title}</td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {ex.venue}, {ex.town}
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal-soft">
                    {!ex.isPublished ? 'Hidden' : ex.endDate >= today ? 'Upcoming' : 'Past'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/exhibitions/${ex.id}/edit`} className="text-clay-dark underline underline-offset-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
