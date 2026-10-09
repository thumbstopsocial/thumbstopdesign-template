import { defineConfig } from "./lib/config.schema";

/**
 * Example client. The studio setup script replaces this file with the
 * client's final config. Pages are listed in nav order.
 */
export default defineConfig({
  slug: "example-joinery",
  business: {
    tradingName: "Example Joinery",
    legalName: "Example Joinery Ltd",
    companyNumber: "12345678",
    registeredAddress: "1 Example Street, Woking, Surrey, GU21 1AA",
    email: "hello@example.co.uk",
    phone: "01483 000000",
  },
  domain: {
    apex: "example.co.uk",
    canonical: "www",
    dnsOnVercel: false,
  },
  pages: [
    {
      path: "/",
      navLabel: "Home",
      seoTitle: "Bespoke kitchens in Surrey | Example Joinery",
      description:
        "Bespoke kitchens, wardrobes and fitted furniture, designed and made in our Woking workshop for homes across Surrey.",
    },
    {
      path: "/about",
      navLabel: "About",
      seoTitle: "About us | Example Joinery",
      description: "Meet the team behind Example Joinery and see how we design, make and fit every piece in house.",
    },
    {
      path: "/contact",
      navLabel: "Contact",
      seoTitle: "Contact us | Example Joinery",
      description: "Tell us about your project and we will come back to you within two working days with next steps.",
    },
  ],
  redirects: [{ from: "/about-us", to: "/about", permanent: true }],
  form: {
    page: "/contact",
    recipients: ["hello@example.co.uk"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 100 },
      { name: "email", label: "Email", type: "email", required: true, maxLength: 200 },
      { name: "phone", label: "Phone", type: "tel", maxLength: 30 },
      { name: "message", label: "Tell us about your project", type: "textarea", required: true, maxLength: 3000 },
    ],
    successMessage: "Thanks, we have your message and will be in touch within two working days.",
    autoReply: false,
  },
  analytics: {},
  socials: {},
  seo: {
    schemaType: "LocalBusiness",
    defaultOgText: "Bespoke joinery, made in Surrey",
  },
  legal: {
    lastUpdated: "2026-10-09",
  },
  care: {
    reportTo: ["hello@example.co.uk"],
  },
});
