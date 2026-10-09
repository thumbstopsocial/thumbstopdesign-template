import { getPage } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";
import { websiteTerms } from "@/lib/legal";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata = pageMetadata(getPage("/terms")!);

export default function Page() {
  return <LegalPage doc={websiteTerms()} />;
}
