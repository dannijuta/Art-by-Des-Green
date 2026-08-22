import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Copyright', alternates: { canonical: '/legal/copyright' } };

export default async function CopyrightPage() {
  const policies = await getPolicies();
  return <PolicyPage title="Copyright" content={policies.copyright} lastUpdated={policies.lastUpdated} />;
}
