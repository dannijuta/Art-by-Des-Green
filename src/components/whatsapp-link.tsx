'use client';

import { trackMetaEvent } from '@/lib/meta-pixel';
import { WhatsAppIcon } from '@/components/icons/social';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function WhatsAppLink({
  href,
  label,
  placement,
  artworkTitle,
  className,
  iconClassName = 'h-4 w-4 shrink-0',
}: {
  href: string;
  label: string;
  placement: string;
  artworkTitle?: string;
  className?: string;
  iconClassName?: string;
}) {
  function handleClick() {
    try {
      window.gtag?.('event', 'whatsapp_click', { placement, artwork_title: artworkTitle });
    } catch {}
    trackMetaEvent('Contact', { method: 'whatsapp', placement, content_name: artworkTitle });
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      <WhatsAppIcon className={iconClassName} />
      {label}
    </a>
  );
}
