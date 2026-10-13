import { AudiencePage, audienceMetadata } from "@/components/build-first/AudiencePage";
import { companies } from "@/lib/build-first-content";

export const metadata = audienceMetadata(companies);

export default function BuildFirstCompaniesPage() {
  return <AudiencePage content={companies} />;
}
