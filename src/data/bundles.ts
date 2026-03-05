import { Bundle } from "@/lib/bundles";

export const bundles: Bundle[] = [
  {
    id: "bundle_agency_starter_kit",
    slug: "agency-starter-kit",
    title: "Agency Starter Kit",
    description:
      "Four high-demand templates for agencies delivering customer support, content, data, and engineering workflows.",
    templateSlugs: [
      "supportbot-pro",
      "socialscheduler",
      "dataentry-automator",
      "codereviewer"
    ],
    priceCents: 27900,
    discountPct: 22,
    isPublished: true
  },
  {
    id: "bundle_full_collection",
    slug: "full-collection",
    title: "Full Collection",
    description:
      "All launch templates bundled for teams that want broad coverage across support, content, operations, and developer use cases.",
    templateSlugs: [
      "supportbot-pro",
      "helpdesk-copilot",
      "contentpipeline",
      "socialscheduler",
      "dataentry-automator",
      "leadenricher",
      "codereviewer",
      "docgenerator"
    ],
    priceCents: 49900,
    discountPct: 30,
    isPublished: true
  }
];
