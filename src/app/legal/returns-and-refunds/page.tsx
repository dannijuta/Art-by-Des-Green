import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Returns & Refunds', alternates: { canonical: '/legal/returns-and-refunds' } };

export default async function ReturnsAndRefundsPage() {
  const policies = await getPolicies();
  return (
    <PolicyPage title="Returns & Refunds" content={policies.returnsRefunds} lastUpdated={policies.lastUpdated} />
  );
}
