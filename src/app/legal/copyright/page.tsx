import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Copyright' };

export default async function CopyrightPage() {
  const policies = await getPolicies();
  return <PolicyPage title="Copyright" content={policies.copyright} needsCompletion={false} />;
}
