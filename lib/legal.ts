import { config } from "./config";

/**
 * Privacy notice and website terms, generated from the business details in
 * the config. A sensible UK starting point, not legal advice: the client
 * confirms both before go-live. Restyled per site via components/site/LegalPage.
 */

export type LegalSection = { heading: string; paragraphs: string[]; list?: string[] };
export type LegalDoc = { title: string; updated: string; intro: string; sections: LegalSection[] };

const b = config.business;
const hasAnalytics = Boolean(config.analytics.gtmId);

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

function who(): string {
  const trading = b.legalName !== b.tradingName ? `, trading as ${b.tradingName}` : "";
  const number = b.companyNumber ? `, a company registered in England and Wales with company number ${b.companyNumber}` : "";
  return `${b.legalName}${trading}${number}, of ${b.registeredAddress}`;
}

export function privacyNotice(): LegalDoc {
  const fieldLabels = config.form.fields.map((f) => f.label.toLowerCase());
  const sections: LegalSection[] = [
    {
      heading: "Who we are",
      paragraphs: [
        `This website is run by ${who()} ("we", "us"). We are the controller of the personal information described in this notice.`,
        ...(b.icoNumber ? [`We are registered with the Information Commissioner's Office under number ${b.icoNumber}.`] : []),
        `If you have any questions about this notice or your information, email us at ${b.email}.`,
      ],
    },
    {
      heading: "What we collect",
      paragraphs: ["We only collect what we need to run the site and reply to you."],
      list: [
        `Details you give us through the contact form: ${fieldLabels.join(", ")}.`,
        "Your IP address, which we use briefly in a scrambled form to stop the contact form being flooded with spam.",
        "Basic technical information our hosting provider records to keep the site secure and working, such as the pages requested and the time.",
        ...(hasAnalytics
          ? ["If you accept analytics cookies, information about how you use the site, such as the pages you visit and how you arrived."]
          : []),
      ],
    },
    {
      heading: "How we use it and why",
      paragraphs: [],
      list: [
        "To reply to your enquiry and, if you ask us to, to provide a quote or our services. Our lawful basis is taking steps at your request before entering into a contract, or our legitimate interest in responding to people who contact us.",
        "To keep the site secure and free from spam. Our lawful basis is our legitimate interest in protecting the site.",
        ...(hasAnalytics
          ? ["To understand how the site is used so we can improve it. Our lawful basis is your consent, which you can withdraw at any time."]
          : []),
      ],
    },
    {
      heading: "Who we share it with",
      paragraphs: [
        "We do not sell your information. We use a small number of trusted providers to run the site, who only process it on our instructions:",
      ],
      list: [
        "Vercel, which hosts the website.",
        "Resend, which delivers contact form messages to our inbox.",
        "Upstash, which stores the scrambled form of your IP address for a few minutes to limit repeated submissions.",
        ...(hasAnalytics ? ["Google, which provides our analytics, only if you accept analytics cookies."] : []),
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "Some of these providers process information outside the UK. Where they do, they use safeguards approved under UK data protection law, such as the UK International Data Transfer Addendum or the UK Extension to the EU-US Data Privacy Framework.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [],
      list: [
        "Enquiries: for as long as we need to deal with your enquiry and any follow-up, normally no more than two years unless you become a client.",
        "Spam protection records: no more than ten minutes.",
        ...(hasAnalytics ? ["Analytics data: no more than 14 months."] : []),
      ],
    },
    {
      heading: "Cookies and similar technology",
      paragraphs: [
        "We store your cookie choice in your browser so we do not ask you on every visit.",
        hasAnalytics
          ? "Analytics cookies are only set if you choose Accept. If you choose Reject, none are set. You can change your mind at any time using the Cookie settings link at the bottom of every page."
          : "We do not use analytics or advertising cookies.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You have the right to ask for a copy of your information, to have it corrected or deleted, to restrict or object to how we use it, and to have it transferred to you or someone else. Where we rely on your consent, you can withdraw it at any time.",
        `To use any of these rights, email us at ${b.email}. We will reply within one month.`,
        "If you are unhappy with how we handle your information, you can complain to the Information Commissioner's Office at ico.org.uk. We would appreciate the chance to put things right first.",
      ],
    },
    {
      heading: "Changes to this notice",
      paragraphs: ["We will update this notice if the way we use your information changes. The date at the top shows when it last changed."],
    },
  ];
  return {
    title: "Privacy notice",
    updated: formatDate(config.legal.lastUpdated),
    intro: `This notice explains how ${b.tradingName} collects and uses personal information through this website.`,
    sections,
  };
}

export function websiteTerms(): LegalDoc {
  return {
    title: "Website terms",
    updated: formatDate(config.legal.lastUpdated),
    intro: `These terms apply when you use this website, which is run by ${who()}. By using the site you agree to them.`,
    sections: [
      {
        heading: "Using the site",
        paragraphs: [
          "You may use the site for your own information. Please do not misuse it, for example by trying to break its security, sending spam through the contact form or copying large parts of it.",
        ],
      },
      {
        heading: "Information on the site",
        paragraphs: [
          "We work to keep the information on the site accurate and up to date, but it is general information, not advice. Any work we do for you is covered by a separate agreement.",
        ],
      },
      {
        heading: "Our content",
        paragraphs: [
          `The words, images, logos and design of the site belong to ${b.legalName} or the people who licensed them to us. You may not reuse them without our written permission.`,
        ],
      },
      {
        heading: "Links to other sites",
        paragraphs: ["Where we link to other websites, we do so for your convenience. We are not responsible for their content or how they handle your information."],
      },
      {
        heading: "Our liability",
        paragraphs: [
          "We are not liable for any loss arising from your use of the site, or from relying on information on it, except where the law does not allow us to limit our liability, such as for death or personal injury caused by our negligence, or fraud.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: ["These terms are governed by the law of England and Wales, and the courts of England and Wales deal with any dispute."],
      },
      {
        heading: "Contact",
        paragraphs: [`If you have a question about these terms, email us at ${b.email}.`],
      },
    ],
  };
}
