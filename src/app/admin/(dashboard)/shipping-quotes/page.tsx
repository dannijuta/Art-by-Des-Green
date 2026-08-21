import { query } from '@/lib/db';
import { formatZAR } from '@/lib/money';
import { approveShippingQuote } from '@/lib/actions/admin-shipping-quotes';

export const metadata = { title: 'Admin — Shipping Quotes' };

interface QuoteRow {
  id: string;
  order_id: string;
  address: Record<string, string>;
  status: string;
  quoted_shipping_cents: number | null;
  created_at: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  artwork_price_cents: number;
  artwork_title: string | null;
}

export default async function AdminShippingQuotesPage() {
  const { rows } = await query<QuoteRow>(`
    select q.id, q.order_id, q.address, q.status, q.quoted_shipping_cents, q.created_at,
           o.order_number, o.customer_name, o.customer_email, o.artwork_price_cents,
           a.public_title as artwork_title
    from shipping_quote_requests q
    join orders o on o.id = q.order_id
    left join order_items oi on oi.order_id = o.id
    left join artworks a on a.id = oi.artwork_id
    order by q.created_at desc
  `);

  const pending = rows.filter((r) => r.status === 'pending');
  const resolved = rows.filter((r) => r.status !== 'pending');

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Shipping Quotes</h1>

      <h2 className="mt-6 text-xs tracking-[0.2em] text-charcoal-soft">AWAITING A QUOTE ({pending.length})</h2>
      <div className="mt-3 space-y-4">
        {pending.map((q) => (
          <div key={q.id} className="border border-border-soft bg-cream p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-charcoal">
                  {q.order_number} — {q.artwork_title ?? 'Artwork'}
                </p>
                <p className="text-xs text-charcoal-soft">
                  {q.customer_name} · {q.customer_email}
                </p>
                <p className="mt-2 text-xs text-charcoal-soft">
                  {q.address?.line1}, {q.address?.city} {q.address?.postalCode}, {q.address?.province} {q.address?.country}
                </p>
                <p className="mt-1 text-xs text-charcoal-soft">Artwork price: {formatZAR(q.artwork_price_cents)}</p>
              </div>
              <form action={approveShippingQuote} className="flex items-end gap-2">
                <input type="hidden" name="quoteId" value={q.id} />
                <label className="text-xs text-charcoal-soft">
                  Shipping cost (R)
                  <input
                    type="number"
                    name="shippingRand"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-32 border border-border bg-ivory px-2 py-1.5 text-sm"
                  />
                </label>
                <button type="submit" className="bg-clay px-4 py-2 text-xs text-cream hover:bg-clay-dark">
                  Approve &amp; Send Payment Link
                </button>
              </form>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-charcoal-soft">No quotes awaiting action.</p>}
      </div>

      <h2 className="mt-10 text-xs tracking-[0.2em] text-charcoal-soft">RESOLVED</h2>
      <div className="mt-3 space-y-2">
        {resolved.map((q) => (
          <div key={q.id} className="flex justify-between border border-border-soft bg-cream px-4 py-3 text-sm">
            <span className="text-charcoal-soft">
              {q.order_number} — {q.customer_name}
            </span>
            <span className="text-charcoal-soft">
              {q.status} {q.quoted_shipping_cents !== null ? `· ${formatZAR(q.quoted_shipping_cents)}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
