import LandingPage from './LandingPage';
import { getMonomindVersion } from '@/lib/versions';

export default async function Page() {
  return <LandingPage monomindVersion={await getMonomindVersion()} />;
}
