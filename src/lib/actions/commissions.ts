'use server';

import { headers } from 'next/headers';
import { query } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendEmail, escapeHtml } from '@/lib/email';
import { commissionFormSchema } from '@/lib/validation';
import { uploadCommissionReference } from '@/lib/storage';

export interface CommissionFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitCommissionForm(
  _prevState: CommissionFormState,
  formData: FormData
): Promise<CommissionFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = commissionFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  if (parsed.data.honeypot) {
    return { status: 'success' };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const allowed = await checkRateLimit('commission', ip, { maxAttempts: 5, windowMinutes: 15 });
  if (!allowed) {
    return { status: 'error', message: 'Too many submissions. Please try again in a little while.' };
  }

  const {
    name,
    email,
    phone,
    preferredContactMethod,
    subject,
    preferredDimensions,
    budgetRange,
    desiredCompletionDate,
    additionalInfo,
    consent,
  } = parsed.data;

  let referenceImagePath: string | null = null;
  const referenceImage = formData.get('referenceImage');
  if (referenceImage instanceof File && referenceImage.size > 0) {
    try {
      const uploaded = await uploadCommissionReference(referenceImage);
      referenceImagePath = uploaded?.path ?? null;
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not upload the reference image.',
      };
    }
  }

  await query(
    `insert into commission_enquiries (
      name, email, phone, preferred_contact_method, subject,
      preferred_dimensions, budget_range, desired_completion_date, reference_image_path, additional_info, consent
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      name,
      email,
      phone || null,
      preferredContactMethod || null,
      subject,
      preferredDimensions || null,
      budgetRange || null,
      desiredCompletionDate || null,
      referenceImagePath,
      additionalInfo || null,
      consent === true || consent === 'on' || consent === 'true',
    ]
  );

  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (notifyTo) {
    await sendEmail({
      to: notifyTo,
      replyTo: email,
      subject: `New commission enquiry from ${name}`,
      html: `
        <h2>New commission enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
        ${preferredContactMethod ? `<p><strong>Preferred contact:</strong> ${escapeHtml(preferredContactMethod)}</p>` : ''}
        <p><strong>Subject / idea:</strong></p>
        <p>${escapeHtml(subject).replace(/\n/g, '<br>')}</p>
        ${preferredDimensions ? `<p><strong>Preferred dimensions:</strong> ${escapeHtml(preferredDimensions)}</p>` : ''}
        ${budgetRange ? `<p><strong>Budget range:</strong> ${escapeHtml(budgetRange)}</p>` : ''}
        ${desiredCompletionDate ? `<p><strong>Desired completion:</strong> ${escapeHtml(desiredCompletionDate)}</p>` : ''}
        ${additionalInfo ? `<p><strong>Additional info:</strong><br>${escapeHtml(additionalInfo).replace(/\n/g, '<br>')}</p>` : ''}
      `,
    });
  }

  return {
    status: 'success',
    message: 'Thank you — your commission enquiry has been sent. Des will be in touch to begin the conversation.',
  };
}
