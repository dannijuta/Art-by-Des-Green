import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Returns & Refunds' };

export default async function ReturnsAndRefundsPage() {
  const policies = await getPolicies();
  return (
    <PolicyPage title="Returns & Refunds" content={policies.returnsRefunds} needsCompletion={policies.needsCompletion} />
  );
}
