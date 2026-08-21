import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Shipping & Collection' };

export default async function ShippingAndCollectionPage() {
  const policies = await getPolicies();
  return (
    <PolicyPage
      title="Shipping & Collection"
      content={policies.shippingCollection}
      needsCompletion={policies.needsCompletion}
    />
  );
}
