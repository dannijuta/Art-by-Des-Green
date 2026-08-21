import Link from 'next/link';
import { getDashboardCounts } from '@/lib/data/artworks';
import { query } from '@/lib/db';

export const metadata = { title: 'Admin Dashboard' };

async function getOrderCounts() {
  const { rows } = await query<{ status: string; count: string }>('select status, count(*) from orders group by status');
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

async function getInboxCounts() {
  const [enquiries, commissions, quotes] = await Promise.all([
    query<{ count: string }>(`select count(*) from enquiries where status = 'new'`),
    query<{ count: string }>(`select count(*) from commission_enquiries where status = 'new'`),
    query<{ count: string }>(`select count(*) from shipping_quote_requests where status = 'pending'`),
  ]);
  return {
    newEnquiries: Number(enquiries.rows[0]?.count ?? 0),
    newCommissions: Number(commissions.rows[0]?.count ?? 0),
    pendingQuotes: Number(quotes.rows[0]?.count ?? 0),
  };
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="border border-border-soft bg-cream px-5 py-6 transition-colors hover:border-clay">
      <p className="text-3xl font-serif text-charcoal">{value}</p>
      <p className="mt-1 text-sm text-charcoal-soft">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const [artworkCounts, orderCounts, inbox] = await Promise.all([
    getDashboardCounts(),
    getOrderCounts(),
    getInboxCounts(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Dashboard</h1>

      <h2 className="mt-8 text-xs tracking-[0.2em] text-charcoal-soft">ARTWORKS</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={Object.values(artworkCounts).reduce((a, b) => a + b, 0)} href="/admin/artworks" />
        <StatCard label="Available" value={artworkCounts.available} href="/admin/artworks?availability=available" />
        <StatCard label="Gallery-only" value={artworkCounts.gallery_only} href="/admin/artworks?availability=gallery_only" />
        <StatCard label="Reserved" value={artworkCounts.reserved} href="/admin/artworks?availability=reserved" />
        <StatCard label="Sold" value={artworkCounts.sold} href="/admin/artworks?availability=sold" />
        <StatCard label="Drafts" value={artworkCounts.draft} href="/admin/artworks?availability=draft" />
      </div>

      <h2 className="mt-8 text-xs tracking-[0.2em] text-charcoal-soft">ORDERS</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending / Reserved" value={(orderCounts.reserved ?? 0) + (orderCounts.pending ?? 0)} href="/admin/orders" />
        <StatCard label="Awaiting Payment" value={orderCounts.awaiting_payment ?? 0} href="/admin/orders" />
        <StatCard label="Paid / Sold" value={orderCounts.sold ?? 0} href="/admin/orders" />
        <StatCard label="Shipping Quotes Awaiting Action" value={inbox.pendingQuotes} href="/admin/shipping-quotes" />
      </div>

      <h2 className="mt-8 text-xs tracking-[0.2em] text-charcoal-soft">INBOX</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="New Enquiries" value={inbox.newEnquiries} href="/admin/enquiries" />
        <StatCard label="New Commission Enquiries" value={inbox.newCommissions} href="/admin/commissions" />
      </div>
    </div>
  );
}
