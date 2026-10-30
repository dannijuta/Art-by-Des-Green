/** Des's WhatsApp number in international format (083 524 4713). */
export const WHATSAPP_NUMBER = '27835244713';
export const PUBLIC_SITE_URL = 'https://www.artbydesgreen.co.za';

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function artworkWhatsappMessage(title: string, slug: string, sold: boolean): string {
  const url = `${PUBLIC_SITE_URL}/artwork/${slug}`;
  return sold
    ? `Hi Des, I love "${title}" (${url}). I see it has been sold. Do you have similar work available, or could I commission something like it?`
    : `Hi Des, I'm interested in "${title}" (${url}). Is it still available?`;
}
