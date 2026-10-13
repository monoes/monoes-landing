import { AudiencePage, audienceMetadata } from "@/components/build-first/AudiencePage";
import { startups } from "@/lib/build-first-content";

export const metadata = audienceMetadata(startups);

export default function BuildFirstStartupsPage() {
  return <AudiencePage content={startups} />;
}
