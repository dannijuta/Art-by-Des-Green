import Script from 'next/script';
import { googleAnalyticsId } from '@/lib/google-analytics';

/**
 * Google Analytics 4 via gtag.js. Loads the built-in measurement ID unless
 * NEXT_PUBLIC_GA_ID overrides it. The Meta Pixel is a separate tag.
 */
export function GoogleAnalyticsTag() {
  const gaId = googleAnalyticsId();
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
