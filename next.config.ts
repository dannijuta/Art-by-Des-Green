import type { NextConfig } from 'next';

// Admin-uploaded artwork/commission images are stored in Supabase Storage,
// a different origin from the site itself — both next/image and the CSP
// below need to explicitly trust it or uploaded images silently fail to
// display after a successful upload.
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
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
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob:${supabaseHostname ? ` https://${supabaseHostname}` : ''}`,
              `connect-src 'self'${isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
              "frame-src https://www.payfast.co.za https://sandbox.payfast.co.za",
              "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
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
