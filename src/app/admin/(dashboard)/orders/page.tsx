import { query } from '@/lib/db';
import { formatZAR } from '@/lib/money';

export const metadata = { title: 'Admin — Orders' };

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  artwork_price_cents: number;
  shipping_cents: number | null;
  total_cents: number | null;
  payfast_payment_id: string | null;
  payfast_pf_payment_id: string | null;
  created_at: string;
  artwork_title: string | null;
}

export default async function AdminOrdersPage() {
  const { rows } = await query<OrderRow>(`
    select o.id, o.order_number, o.status, o.customer_name, o.customer_email,
           o.artwork_price_cents, o.shipping_cents, o.total_cents,
           o.payfast_payment_id, o.payfast_pf_payment_id, o.created_at,
           a.public_title as artwork_title
    from orders o
    left join order_items oi on oi.order_id = o.id
    left join artworks a on a.id = oi.artwork_id
    order by o.created_at desc
  `);

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Orders ({rows.length})</h1>

      <div className="mt-6 overflow-x-auto border border-border-soft bg-cream">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border-soft text-xs text-charcoal-soft">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Artwork</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">PayFast Ref</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3 text-charcoal">{o.order_number}</td>
                <td className="px-4 py-3 text-charcoal-soft">{o.artwork_title ?? '—'}</td>
                <td className="px-4 py-3 text-charcoal-soft">
                  {o.customer_name}
                  <br />
                  <span className="text-xs">{o.customer_email}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase tracking-wide">{o.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">
                  {o.total_cents !== null ? formatZAR(o.total_cents) : 'Awaiting quote'}
                </td>
                <td className="px-4 py-3 text-xs text-charcoal-soft">{o.payfast_pf_payment_id ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-charcoal-soft">{new Date(o.created_at).toLocaleDateString('en-ZA')}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-charcoal-soft">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
