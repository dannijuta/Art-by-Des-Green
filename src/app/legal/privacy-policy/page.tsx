import { getPolicies } from '@/lib/data/settings';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata = { title: 'Privacy Policy' };

export default async function PrivacyPolicyPage() {
  const policies = await getPolicies();
  return <PolicyPage title="Privacy Policy" content={policies.privacyPolicy} needsCompletion={policies.needsCompletion} />;
}
