import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Terms & Conditions' };

export default async function TermsPage() {
  const policies = await getPolicies();
  return <PolicyPage title="Terms & Conditions" content={policies.terms} needsCompletion={policies.needsCompletion} />;
}
