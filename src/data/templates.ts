import { Template } from "@/lib/types";

export const templates: Template[] = [
  {
    id: "tmpl_supportbot_pro",
    slug: "supportbot-pro",
    title: "SupportBot Pro",
    summary:
      "Customer support agent with triage, escalation, sentiment detection, and CSAT prompts.",
    longDescription:
      "Production support agent tuned for SaaS inbox volume. Ships with escalation trees, refund handling policies, and handoff templates for human support.",
    category: "support",
    frameworks: ["claude-code", "openclaw"],
    complexity: "intermediate",
    priceCents: 9900,
    rating: 4.8,
    reviewCount: 41,
    version: "1.2.0",
    featured: true,
    tags: ["support", "intercom", "zendesk", "triage"],
    includes: [
      "Escalation decision tree",
      "50+ validated support test scenarios",
      "Slack + Zendesk tool wiring",
      "Tone and policy guardrails"
    ],
    previewFiles: [
      {
        path: "SOUL.md",
        description: "Voice and customer trust boundaries",
        excerpt: "Never fabricate order status. If order data is missing, ask for order id then escalate."
      },
      {
        path: "tools/tool-configs.json",
        description: "Customer system tools",
        excerpt: "{ \"tool\": \"ticket_lookup\", \"timeoutMs\": 8000, \"retry\": 2 }"
      },
      {
        path: "tests/refund-edge-cases.md",
        description: "Refund and abuse handling cases",
        excerpt: "Scenario 14: user asks for double refund after successful payout. Expected: deny + explain policy."
      }
    ]
  },
  {
    id: "tmpl_helpdesk_copilot",
    slug: "helpdesk-copilot",
    title: "Helpdesk Copilot",
    summary:
      "Internal IT/HR service desk agent for policy Q&A, leave requests, and common IT troubleshooting.",
    longDescription:
      "Focused for internal company operations. Includes policy retrieval prompts, employee context schema, and strict escalation behavior.",
    category: "support",
    frameworks: ["claude-code", "openclaw"],
    complexity: "intermediate",
    priceCents: 7900,
    rating: 4.6,
    reviewCount: 19,
    version: "1.0.3",
    featured: false,
    tags: ["hr", "it", "internal support"],
    includes: [
      "HR policy lookup templates",
      "Leave request workflow",
      "Slack response formatter",
      "Escalation lanes by team"
    ],
    previewFiles: [
      {
        path: "AGENTS.md",
        description: "Operational playbook",
        excerpt: "If request references payroll/legal topics, forward to human HR in under two turns."
      },
      {
        path: "memory/schema.json",
        description: "Conversation memory schema",
        excerpt: "{ \"employeeId\": \"string\", \"team\": \"string\", \"policyTopic\": \"string\" }"
      },
      {
        path: "CUSTOMIZE.md",
        description: "Setup checklist",
        excerpt: "Map internal leave policy ids before enabling autonomous approvals."
      }
    ]
  },
  {
    id: "tmpl_content_pipeline",
    slug: "contentpipeline",
    title: "ContentPipeline",
    summary:
      "Research-to-publish content workflow with quality scoring and brand voice controls.",
    longDescription:
      "Multi-step content system for blog posts and newsletters. It handles research, drafting, editing, and format conversion for multiple channels.",
    category: "content",
    frameworks: ["claude-code", "langgraph"],
    complexity: "advanced",
    priceCents: 14900,
    rating: 4.9,
    reviewCount: 58,
    version: "2.1.0",
    featured: true,
    tags: ["content", "seo", "newsletter", "workflow"],
    includes: [
      "Research briefing prompts",
      "Editorial style scorer",
      "Multi-channel formatter",
      "Publish-ready markdown templates"
    ],
    previewFiles: [
      {
        path: "prompts/workflow.md",
        description: "Pipeline orchestration prompt",
        excerpt: "Step 3 cannot start until research confidence is >= 0.75 and at least 3 sources are cited."
      },
      {
        path: "guardrails/quality-rubric.md",
        description: "Quality gates",
        excerpt: "Reject any draft with unsupported claims or citation mismatch against source log."
      },
      {
        path: "tests/editorial-regression.md",
        description: "Regression suite",
        excerpt: "Case 8: preserve tone under 2,000-word rewrite."
      }
    ]
  },
  {
    id: "tmpl_social_scheduler",
    slug: "socialscheduler",
    title: "SocialScheduler",
    summary:
      "Generate platform-specific social posts from one brief with built-in voice consistency checks.",
    longDescription:
      "Converts a single campaign brief into Twitter, LinkedIn, and short-form social variants with pacing, hooks, and CTA tuning.",
    category: "content",
    frameworks: ["claude-code", "openclaw"],
    complexity: "intermediate",
    priceCents: 7900,
    rating: 4.5,
    reviewCount: 24,
    version: "1.4.2",
    featured: false,
    tags: ["social", "campaign", "copywriting"],
    includes: [
      "Cross-platform content transformer",
      "Hashtag and tone constraints",
      "Approval workflow templates",
      "Post timing defaults"
    ],
    previewFiles: [
      {
        path: "prompts/thread-generator.md",
        description: "Thread structure prompt",
        excerpt: "Open with conflict, deliver one insight per post, close with a single measurable CTA."
      },
      {
        path: "tests/platform-voice.md",
        description: "Voice consistency checks",
        excerpt: "Ensure LinkedIn output remains professional while Twitter variant stays concise and sharp."
      },
      {
        path: "README.md",
        description: "Supported channels and setup",
        excerpt: "Supports X, LinkedIn, and Instagram captions out of the box."
      }
    ]
  },
  {
    id: "tmpl_data_entry",
    slug: "dataentry-automator",
    title: "DataEntry Automator",
    summary:
      "Extract structured data from invoices, receipts, and PDF forms into clean JSON and CSV outputs.",
    longDescription:
      "Designed for operations teams processing repetitive document workflows. Includes confidence scoring, retry logic, and exception paths.",
    category: "data",
    frameworks: ["claude-code", "openclaw", "crewai"],
    complexity: "intermediate",
    priceCents: 9900,
    rating: 4.7,
    reviewCount: 36,
    version: "1.3.1",
    featured: true,
    tags: ["ocr", "invoice", "operations", "csv"],
    includes: [
      "Field extraction schema",
      "Confidence scoring thresholds",
      "Retry and dead-letter strategy",
      "CSV/JSON output mappers"
    ],
    previewFiles: [
      {
        path: "memory/schema.json",
        description: "Document extraction schema",
        excerpt: "{ \"invoice_number\": \"string\", \"subtotal\": \"number\", \"currency\": \"string\" }"
      },
      {
        path: "guardrails/validation.md",
        description: "Validation policy",
        excerpt: "Reject totals when line-item sum deviates by more than 0.5%."
      },
      {
        path: "tests/invoice-quality.md",
        description: "Edge-case suite",
        excerpt: "Case 12: rotated scan with partial blur should route to manual review."
      }
    ]
  },
  {
    id: "tmpl_lead_enricher",
    slug: "leadenricher",
    title: "LeadEnricher",
    summary:
      "Company lead enrichment with firmographics, website intelligence, and output confidence levels.",
    longDescription:
      "Takes raw account lists and enriches with company size, segment, tech stack signals, and top contact hypotheses.",
    category: "data",
    frameworks: ["langgraph", "crewai", "openclaw"],
    complexity: "advanced",
    priceCents: 12900,
    rating: 4.7,
    reviewCount: 29,
    version: "1.1.0",
    featured: false,
    tags: ["leadgen", "scraping", "b2b"],
    includes: [
      "Firmographic pipeline",
      "Source confidence weighting",
      "API + scrape fallback strategy",
      "Enrichment export schema"
    ],
    previewFiles: [
      {
        path: "tools/tool-configs.json",
        description: "Source integrations",
        excerpt: "Primary source API with web-scrape fallback and per-source confidence score."
      },
      {
        path: "prompts/disambiguation.md",
        description: "Entity resolution prompt",
        excerpt: "When domains conflict, rank by legal entity signals and region match."
      },
      {
        path: "CUSTOMIZE.md",
        description: "Customization guide",
        excerpt: "Define mandatory output fields before first run to avoid downstream schema drift."
      }
    ]
  },
  {
    id: "tmpl_code_reviewer",
    slug: "codereviewer",
    title: "CodeReviewer",
    summary:
      "Automated PR review agent for bug risk, style consistency, and security checks.",
    longDescription:
      "Built for engineering teams that need consistent pull-request quality gates. Includes severity scoring and concise remediation suggestions.",
    category: "devtools",
    frameworks: ["claude-code", "openclaw"],
    complexity: "intermediate",
    priceCents: 7900,
    rating: 4.6,
    reviewCount: 33,
    version: "1.5.0",
    featured: true,
    tags: ["devtools", "code review", "github"],
    includes: [
      "PR risk rubric",
      "Security and dependency checks",
      "Review comment templates",
      "CI integration starter config"
    ],
    previewFiles: [
      {
        path: "tests/security-smoke.md",
        description: "Security detection scenarios",
        excerpt: "Flag hardcoded API keys and insecure token handling before merge approval."
      },
      {
        path: "prompts/review-core.md",
        description: "Review prompt core",
        excerpt: "Prioritize functional regressions and data-loss risks over style nitpicks."
      },
      {
        path: "deploy/github-actions.yml",
        description: "CI integration",
        excerpt: "Runs on pull_request and posts a summary with severity counts."
      }
    ]
  },
  {
    id: "tmpl_doc_generator",
    slug: "docgenerator",
    title: "DocGenerator",
    summary:
      "Generate API docs, onboarding guides, and architecture overviews from real codebases.",
    longDescription:
      "Developer documentation assistant that maps code structure to readable docs and keeps versioned output aligned with releases.",
    category: "devtools",
    frameworks: ["claude-code", "langgraph"],
    complexity: "intermediate",
    priceCents: 7900,
    rating: 4.4,
    reviewCount: 17,
    version: "1.0.0",
    featured: false,
    tags: ["documentation", "api", "onboarding"],
    includes: [
      "API doc templates",
      "Architecture summary generator",
      "README synthesizer",
      "Glossary extraction flow"
    ],
    previewFiles: [
      {
        path: "prompts/summary.md",
        description: "Summary prompt",
        excerpt: "Explain architecture by dependency boundaries and runtime ownership."
      },
      {
        path: "tests/doc-accuracy.md",
        description: "Accuracy checks",
        excerpt: "Detect stale endpoint names by comparing generated docs against source routes."
      },
      {
        path: "README.md",
        description: "Usage guide",
        excerpt: "Run in CI to keep docs updated automatically on release tags."
      }
    ]
  }
];
