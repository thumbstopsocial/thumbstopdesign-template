import { getPage } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";
import { privacyNotice } from "@/lib/legal";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata = pageMetadata(getPage("/privacy")!);

export default function Page() {
  return <LegalPage doc={privacyNotice()} />;
}
