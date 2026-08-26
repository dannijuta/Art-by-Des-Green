import 'server-only';
import type { CreatePaymentParams, NotificationValidationResult, PaymentFormData, PaymentProvider } from './provider';
import { formatAmount, isKnownPayfastIp, md5, toParamString } from './payfast-signature';

interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox: boolean;
}

function getConfig(): PayfastConfig {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  if (!merchantId || !merchantKey) {
    throw new Error('PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY are not configured.');
  }
  return {
    merchantId,
    merchantKey,
    passphrase: process.env.PAYFAST_PASSPHRASE || undefined,
    sandbox: process.env.PAYFAST_SANDBOX !== 'false',
  };
}

export class PayfastProvider implements PaymentProvider {
  readonly name = 'payfast';

  buildPaymentForm(params: CreatePaymentParams): PaymentFormData {
    const config = getConfig();
    const [firstName, ...rest] = params.customerName.trim().split(' ');
    const lastName = rest.join(' ') || firstName;

    // Field order matters for the signature — this must match the order
    // PayFast documents its attributes in.
    const pairs: Array<[string, string]> = [
      ['merchant_id', config.merchantId],
      ['merchant_key', config.merchantKey],
      ['return_url', params.returnUrl],
      ['cancel_url', params.cancelUrl],
      ['notify_url', params.notifyUrl],
      ['name_first', firstName || params.customerName],
      ['name_last', lastName],
      ['email_address', params.customerEmail],
      ['m_payment_id', params.orderNumber],
      ['amount', formatAmount(params.amountCents)],
      ['item_name', params.itemName],
      ['item_description', params.itemDescription ?? ''],
    ];

    const signature = md5(toParamString(pairs, config.passphrase));
    const fields: Record<string, string> = Object.fromEntries(pairs.filter(([, v]) => v !== ''));
    fields.signature = signature;

    const actionUrl = config.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    return { actionUrl, fields };
  }

  async validateNotification({
    rawBody,
    sourceIp,
    expectedAmountCents,
  }: {
    rawBody: string;
    sourceIp: string | null;
    expectedAmountCents: number;
  }): Promise<NotificationValidationResult> {
    const config = getConfig();
    const reasons: string[] = [];

    const searchParams = new URLSearchParams(rawBody);
    const entries = [...searchParams.entries()];
    const dataObj: Record<string, string> = Object.fromEntries(entries);

    // Rebuild the param string in the exact order PayFast sent it, stopping
    // at (and excluding) the `signature` field itself.
    const orderedPairsBeforeSignature: Array<[string, string]> = [];
    for (const [key, value] of entries) {
      if (key === 'signature') break;
      orderedPairsBeforeSignature.push([key, value]);
    }
    const paramString = toParamString(orderedPairsBeforeSignature, config.passphrase, true);
    const expectedSignature = md5(paramString);
    const signatureValid = dataObj.signature === expectedSignature;
    if (!signatureValid) reasons.push('signature_mismatch');

    const merchantValid = dataObj.merchant_id === config.merchantId;
    if (!merchantValid) reasons.push('merchant_id_mismatch');

    const amountGross = Number.parseFloat(dataObj.amount_gross ?? '0');
    const amountGrossCents = Math.round(amountGross * 100);
    const amountValid = Math.abs(amountGrossCents - expectedAmountCents) <= 1;
    if (!amountValid) reasons.push('amount_mismatch');

    const sourceIpValid = sourceIp ? isKnownPayfastIp(sourceIp) : false;
    if (!sourceIpValid) reasons.push('source_ip_not_recognised (informational only, not blocking)');

    let serverConfirmed = false;
    try {
      const host = config.sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
      const response = await fetch(`https://${host}/eng/query/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: rawBody,
        signal: AbortSignal.timeout(10_000),
      });
      const text = (await response.text()).trim();
      serverConfirmed = text === 'VALID';
      if (!serverConfirmed) reasons.push('server_confirmation_failed');
    } catch {
      reasons.push('server_confirmation_error');
    }

    // The source-IP check is informational-only (PayFast's published IP list
    // can change, and requests may traverse proxies) — signature + merchant +
    // amount + PayFast's own server confirmation are what actually gate trust.
    const valid = signatureValid && merchantValid && amountValid && serverConfirmed;

    return {
      valid,
      reasons,
      merchantPaymentId: dataObj.m_payment_id,
      providerPaymentId: dataObj.pf_payment_id,
      paymentStatus: dataObj.payment_status,
      amountGrossCents,
    };
  }
}

export const payfastProvider = new PayfastProvider();
