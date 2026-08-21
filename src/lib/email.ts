import 'server-only';
import { Resend } from 'resend';

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Sends a transactional email via Resend when RESEND_API_KEY is configured.
 * If it isn't (e.g. this hasn't been set up yet), the notification is logged
 * to the server console instead of failing the request — form submissions are
 * always saved to the database regardless, so nothing is lost either way.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Art by Des Green <onboarding@resend.dev>';

  if (!apiKey) {
    console.info(`[email not sent — RESEND_API_KEY not configured] to=${to} subject="${subject}"`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html, replyTo });
  if (error) {
    console.error('Failed to send email via Resend:', error);
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
