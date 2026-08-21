import 'server-only';
import { query, withTransaction } from '@/lib/db';
import type { Order, OrderStatus } from '@/types/domain';

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_method: Order['shippingMethod'];
  shipping_address: Record<string, string> | null;
  artwork_price_cents: number;
  shipping_cents: number | null;
  total_cents: number | null;
  payfast_payment_id: string | null;
  payfast_pf_payment_id: string | null;
  created_at: string;
  expires_at: string | null;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingMethod: row.shipping_method,
    shippingAddress: row.shipping_address,
    artworkPriceCents: row.artwork_price_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    payfastPaymentId: row.payfast_payment_id,
    payfastPfPaymentId: row.payfast_pf_payment_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { rows } = await query<OrderRow>('select * from orders where id = $1', [id]);
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getOrderItemArtworkId(orderId: string): Promise<string | null> {
  const { rows } = await query<{ artwork_id: string }>('select artwork_id from order_items where order_id = $1 limit 1', [
    orderId,
  ]);
  return rows[0]?.artwork_id ?? null;
}

/** Releases any reservation past its expiry, freeing the artwork back to available. Safe to call often. */
export async function releaseExpiredReservations(): Promise<number> {
  return withTransaction(async (client) => {
    const { rows } = await client.query<{ id: string; artwork_id: string; order_id: string }>(
      `select id, artwork_id, order_id from inventory_reservations
       where status = 'active' and expires_at < now()`
    );
    for (const row of rows) {
      await client.query(`update inventory_reservations set status = 'released' where id = $1`, [row.id]);
      await client.query(
        `update artworks set availability_status = 'available'
         where id = $1 and availability_status = 'reserved'`,
        [row.artwork_id]
      );
      await client.query(
        `update orders set status = 'expired' where id = $1 and status in ('reserved','quote_required','awaiting_payment')`,
        [row.order_id]
      );
    }
    return rows.length;
  });
}

export interface CreateReservedOrderArgs {
  artworkId: string;
  orderNumber: string;
  status: 'reserved' | 'quote_required';
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingMethod: Order['shippingMethod'];
  shippingAddress: Record<string, string> | null;
  artworkPriceCents: number;
  shippingCents: number | null;
  totalCents: number | null;
  reservationMinutes: number;
}

export type ReserveResult = { ok: true; orderId: string } | { ok: false; reason: 'artwork_unavailable' | 'already_reserved' };

/**
 * Creates the order and its inventory reservation inside one transaction.
 * The one-of-one guarantee comes from the database's partial unique index
 * (one_active_reservation_per_artwork) — if a concurrent request already
 * reserved this artwork, the INSERT here fails and we roll back cleanly.
 */
export async function createReservedOrder(args: CreateReservedOrderArgs): Promise<ReserveResult> {
  try {
    const orderId = await withTransaction(async (client) => {
      const artworkCheck = await client.query<{ availability_status: string }>(
        'select availability_status from artworks where id = $1 for update',
        [args.artworkId]
      );
      if (artworkCheck.rows[0]?.availability_status !== 'available') {
        throw new UnavailableError();
      }

      const orderResult = await client.query<{ id: string }>(
        `insert into orders (
          order_number, status, customer_name, customer_email, customer_phone,
          shipping_method, shipping_address, artwork_price_cents, shipping_cents, total_cents,
          payfast_payment_id, expires_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now() + ($12 || ' minutes')::interval)
        returning id`,
        [
          args.orderNumber,
          args.status,
          args.customerName,
          args.customerEmail,
          args.customerPhone,
          args.shippingMethod,
          args.shippingAddress ? JSON.stringify(args.shippingAddress) : null,
          args.artworkPriceCents,
          args.shippingCents,
          args.totalCents,
          args.orderNumber,
          args.reservationMinutes,
        ]
      );
      const orderId = orderResult.rows[0].id;

      await client.query('insert into order_items (order_id, artwork_id, unit_price_cents) values ($1,$2,$3)', [
        orderId,
        args.artworkId,
        args.artworkPriceCents,
      ]);

      // This is the statement that actually enforces one-of-one: the partial
      // unique index on (artwork_id) where status='active' rejects a second
      // concurrent active reservation for the same artwork.
      await client.query(
        `insert into inventory_reservations (artwork_id, order_id, status, expires_at)
         values ($1, $2, 'active', now() + ($3 || ' minutes')::interval)`,
        [args.artworkId, orderId, args.reservationMinutes]
      );

      await client.query(`update artworks set availability_status = 'reserved' where id = $1`, [args.artworkId]);

      return orderId;
    });
    return { ok: true, orderId };
  } catch (err) {
    if (err instanceof UnavailableError) return { ok: false, reason: 'artwork_unavailable' };
    if (isUniqueViolation(err)) return { ok: false, reason: 'already_reserved' };
    throw err;
  }
}

class UnavailableError extends Error {}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505';
}

export async function releaseReservation(orderId: string): Promise<void> {
  await withTransaction(async (client) => {
    const { rows } = await client.query<{ artwork_id: string }>(
      `update inventory_reservations set status = 'released'
       where order_id = $1 and status = 'active'
       returning artwork_id`,
      [orderId]
    );
    if (rows[0]) {
      await client.query(
        `update artworks set availability_status = 'available' where id = $1 and availability_status = 'reserved'`,
        [rows[0].artwork_id]
      );
    }
    await client.query(
      `update orders set status = 'cancelled' where id = $1 and status in ('reserved','quote_required','awaiting_payment')`,
      [orderId]
    );
  });
}

export async function markOrderAwaitingPayment(orderId: string): Promise<void> {
  await query(`update orders set status = 'awaiting_payment' where id = $1 and status in ('reserved','quote_required')`, [
    orderId,
  ]);
}

export async function setOrderPayfastPaymentId(orderId: string, payfastPaymentId: string): Promise<void> {
  await query('update orders set payfast_payment_id = $1 where id = $2', [payfastPaymentId, orderId]);
}
