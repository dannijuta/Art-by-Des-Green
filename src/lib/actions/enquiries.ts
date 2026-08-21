'use server';

import { headers } from 'next/headers';
import { query } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendEmail, escapeHtml } from '@/lib/email';
import { contactFormSchema } from '@/lib/validation';

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  if (parsed.data.honeypot) {
    // Silently "succeed" for bots so they don't learn the honeypot was tripped.
    return { status: 'success' };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const allowed = await checkRateLimit('contact', ip, { maxAttempts: 5, windowMinutes: 15 });
  if (!allowed) {
    return { status: 'error', message: 'Too many submissions. Please try again in a little while.' };
  }

  const { name, email, phone, reason, artworkId, message, consent } = parsed.data;

  let artworkTitle: string | null = null;
  let artworkUrl: string | null = null;
  if (artworkId) {
    const { rows } = await query<{ public_title: string; slug: string }>(
      'select public_title, slug from artworks where id = $1',
      [artworkId]
    );
    if (rows[0]) {
      artworkTitle = rows[0].public_title;
      artworkUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/artwork/${rows[0].slug}`;
    }
  }

  await query(
    `insert into enquiries (reason, name, email, phone, artwork_id, message, consent)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [reason, name, email, phone || null, artworkId || null, message, consent === true || consent === 'on' || consent === 'true']
  );

  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (notifyTo) {
    await sendEmail({
      to: notifyTo,
      replyTo: email,
      subject: `New enquiry (${reason}) from ${name}`,
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
        ${artworkTitle ? `<p><strong>Artwork:</strong> ${escapeHtml(artworkTitle)} — <a href="${artworkUrl}">${artworkUrl}</a></p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });
  }

  return { status: 'success', message: 'Thank you — your message has been sent. Des will be in touch soon.' };
}
