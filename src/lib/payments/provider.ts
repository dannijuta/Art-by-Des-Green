/**
 * Payment provider abstraction. The checkout flow and order/reservation logic
 * talk only to this interface, so a second provider (e.g. Yoco) could be added
 * later without touching the checkout, reservation, or admin code.
 */

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  itemName: string;
  itemDescription?: string;
  customerName: string;
  customerEmail: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/** A provider returns an action URL + hidden fields for a POST-redirect form (no card data ever touches this app). */
export interface PaymentFormData {
  actionUrl: string;
  fields: Record<string, string>;
}

export interface NotificationValidationResult {
  /** True only if every check (signature, source, amount, merchant, server confirmation) passed. */
  valid: boolean;
  reasons: string[];
  merchantPaymentId?: string;
  providerPaymentId?: string;
  paymentStatus?: string;
  amountGrossCents?: number;
}

export interface PaymentProvider {
  readonly name: string;
  buildPaymentForm(params: CreatePaymentParams): PaymentFormData;
  validateNotification(args: {
    rawBody: string;
    sourceIp: string | null;
    expectedAmountCents: number;
  }): Promise<NotificationValidationResult>;
}
