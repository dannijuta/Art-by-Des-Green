import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { adminLogout } from '@/lib/actions/admin-auth';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/artworks', label: 'Artworks' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/shipping-quotes', label: 'Shipping Quotes' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/commissions', label: 'Commissions' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authoritative check — the proxy only does a fast, DB-free signature check;
  // this confirms the session is still valid (not revoked) against the DB.
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex flex-col lg:flex-row">
        <aside className="border-b border-border-soft bg-charcoal px-5 py-6 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <p className="font-serif text-xl italic text-cream">Art by Des</p>
          <p className="mt-1 text-xs text-cream/50">Admin dashboard</p>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Admin navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={adminLogout} className="mt-8">
            <button type="submit" className="px-3 py-2 text-sm text-cream/60 hover:text-cream">
              Sign out ({session.email})
            </button>
          </form>
        </aside>
        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
