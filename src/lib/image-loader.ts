// Supabase Storage images are resized + converted to WebP by Supabase's
// image transformation endpoint (not Vercel's metered optimizer).
// Local /public files (a handful) still use Vercel's optimizer.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.includes('.supabase.co/storage/v1/object/public/')) {
    const url = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${url}${url.includes('?') ? '&' : '?'}width=${width}&quality=${quality ?? 70}&resize=contain`;
  }
  if (src.startsWith('/') && !src.startsWith('//')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
  }
  return src;
}
