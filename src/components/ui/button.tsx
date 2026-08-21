import Link from 'next/link';
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3 text-sm tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: `${base} bg-clay text-cream hover:bg-clay-dark`,
  secondary: `${base} border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream`,
  ghost: `${base} text-charcoal underline underline-offset-4 decoration-clay/60 hover:decoration-clay`,
};

type Variant = keyof typeof variants;

interface CommonProps {
  variant?: Variant;
  className?: string;
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  className = '',
  href,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={`${variants[variant]} ${className}`} {...props} />;
}
