import type { NextConfig } from 'next';

// Admin-uploaded artwork/commission images are stored in Supabase Storage,
// a different origin from the site itself — both next/image and the CSP
// below need to explicitly trust it or uploaded images silently fail to
// display after a successful upload.
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    // A single quality tier keeps every image request on the site sharing
    // the same cached variants — Vercel's free image-optimization quota is
    // billed per distinct (url, width, quality) combination, and a second
    // quality tier used in only one or two places (the lightbox, the detail
    // page hero) was quietly doubling the number of variants generated for
    // no visible benefit, and started returning 402s once the monthly quota
    // was used up.
    qualities: [75],
    // Same reasoning as qualities above: fewer distinct widths means fewer
    // distinct (url, width, quality) transformations Vercel has to generate
    // and count against the free quota. Next.js's default deviceSizes goes
    // up to 3840px (4K) — nothing on this site is ever displayed wider than
    // ~55vw of a real viewport (see every `sizes` prop in src/), so even at
    // 2x pixel density that tops out well under 2000px. Trimmed to five
    // sensible breakpoints instead of the default eight.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHostname
      ? [{ protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  experimental: {
    serverActions: {
      // Admin artwork/commission image uploads validate up to 15MB
      // (src/lib/storage.ts) — this must be at least that, or a real phone
      // photo gets rejected by Next.js itself before that check ever runs.
      // Next.js defaults this to 1MB.
      bodySizeLimit: '16mb',
    },
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // React dev mode needs eval() for its debugging tools; production
              // builds never call eval(), so this only loosens local `next dev`.
              // connect.facebook.net serves the Meta Pixel base script.
              `script-src 'self' 'unsafe-inline' https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // www.facebook.com is the Meta Pixel's <noscript> fallback pixel
              // and its tracking beacon endpoint.
              `img-src 'self' data: blob: https://www.facebook.com${supabaseHostname ? ` https://${supabaseHostname}` : ''}`,
              `connect-src 'self' https://www.facebook.com${isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
              // TEMPORARY DIAGNOSTIC: form-action was blocking a POST to the
              // exact origin it explicitly allowed (https://www.payfast.co.za),
              // which shouldn't be possible under a normal same-origin source
              // match. Opening this fully so the real PayFast redirect chain
              // can complete and reveal where it actually goes — narrow this
              // back down once we see the real destination(s). See chat.
              "frame-src https://*.payfast.co.za https://payfast.co.za",
              'form-action https:',
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
