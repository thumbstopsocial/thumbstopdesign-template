import type { ComponentType } from "react";
import { publicForm } from "@/lib/config";
import { ContactForm } from "@/components/site/ContactForm";
import { PagePlaceholder } from "@/components/site/PagePlaceholder";

/**
 * One entry per page in client.config.ts, keyed by path. The site check fails
 * if a config page has no entry here, or an entry has no config page.
 * /new-site replaces these placeholders with the pages built from the deck.
 */
export const pageComponents: Record<string, ComponentType> = {
  "/": () => <PagePlaceholder path="/" />,
  "/about": () => <PagePlaceholder path="/about" />,
  "/contact": () => (
    <PagePlaceholder path="/contact">
      <ContactForm form={publicForm} />
    </PagePlaceholder>
  ),
};
