import LandingPage from './LandingPage';
import { getMonomindVersion } from '@/lib/versions';
import { getMonomindAgentCount } from '@/lib/monomind-catalog';

export default async function Page() {
  const [monomindVersion, agentCount] = await Promise.all([getMonomindVersion(), getMonomindAgentCount()]);
  return <LandingPage monomindVersion={monomindVersion} agentCount={agentCount} />;
}
