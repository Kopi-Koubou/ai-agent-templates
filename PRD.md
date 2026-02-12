# Product Requirements Document: AI Agent Templates Marketplace

**Author:** Kato
**Date:** February 11, 2026
**Version:** 1.0
**Status:** Draft
**Target:** $5K MRR within 90 days
**Codename:** AgentVault

---

## 1. Problem Statement

The AI agent ecosystem is exploding. Claude Code, OpenClaw, CrewAI, LangGraph, AutoGen — every week a new framework ships. But there's a massive gap between "install the SDK" and "agent that actually works in production."

**The pain is real:**

- **Developers** spend 20-40 hours building their first production agent, mostly on boilerplate: prompt engineering, tool wiring, error handling, memory management, guardrails
- **Indie hackers** want to sell AI-powered services (support bots, content pipelines, data entry automation) but lack the agent architecture expertise to build reliable systems
- **Small business owners** hear "AI agents can do X" but can't bridge the gap from concept to deployed agent without hiring a $150/hr consultant

**Root cause:** Agent frameworks provide primitives, not solutions. It's like having React without component libraries — you can build anything, but you start from scratch every time.

**Market signal:**
- "Claude Code agent template" gets 8K+ monthly searches (growing 40% MoM)
- OpenClaw Discord has 200+ "how do I build a ___ agent?" threads per week
- GitHub repos with "agent template" in the title average 500+ stars within a month
- Prompt marketplace (PromptBase) did $2M+ in 2025 selling static prompts — agents are 10x more valuable

**The opportunity:** Curated, production-ready agent templates that work out of the box. Not tutorials. Not boilerplate repos. Complete agent configurations with tested prompts, tool integrations, memory schemas, and deployment guides.

---

## 2. Solution Overview

**AgentVault** is a marketplace for production-ready AI agent templates, specifically targeting OpenClaw and Claude Code ecosystems first, with expansion to LangGraph/CrewAI.

### Core Value Proposition

**For buyers:** Skip 20-40 hours of agent development. Buy a template, customize it for your use case, deploy in under an hour.

**For sellers (Phase 2):** Monetize your agent expertise. Build once, sell repeatedly. Earn 70% of every sale.

### What a "Template" Is

A template is NOT just a prompt. It's a complete agent configuration package:

```
agent-template/
├── SOUL.md              # Agent identity, personality, boundaries
├── IDENTITY.md          # Role definition, skills, domain knowledge
├── AGENTS.md            # Operational guide, session startup, safety rules
├── tools/               # Pre-configured tool integrations
│   ├── tool-configs.json
│   └── custom-tools/    # Any custom MCP tools
├── memory/              # Memory schema and seed data
│   ├── schema.json
│   └── seed-data.md
├── prompts/             # Tested system prompts and few-shot examples
├── guardrails/          # Safety rules, content filters, rate limits
├── deploy/              # Deployment configs (OpenClaw, Docker, Vercel)
│   ├── openclaw.yaml
│   └── docker-compose.yml
├── tests/               # Test scenarios and expected outputs
├── CUSTOMIZE.md         # Step-by-step customization guide
└── README.md            # Overview, screenshots, demo link
```

### Why This Wins

| Existing Solutions | Problem | AgentVault |
|---|---|---|
| GitHub template repos | Unmaintained, no quality control, no support | Curated, tested monthly, version-tracked |
| Prompt marketplaces (PromptBase) | Just prompts, no architecture | Complete agent packages with tools + memory |
| Agency/consultants | $5K-50K per agent build | $29-199 per template, self-service |
| Framework docs/tutorials | Educational, not production-ready | Deploy-ready with tested configs |
| ChatGPT GPT Store | Locked to OpenAI, chat-only | Framework-agnostic, full agent capabilities |

---

## 3. Target Audience

### Primary: The Indie Hacker Builder (Alex, 29)

- **Profile:** Solo developer or 2-person team building SaaS/services
- **Technical level:** Can code (Python/TypeScript), but not an AI/ML specialist
- **Motivation:** Wants to add AI agent capabilities to their product or sell agent-powered services
- **Budget:** $29-199 per template is a no-brainer vs. 40 hours of dev time
- **Where they are:** Indie Hackers, Hacker News, Twitter/X, Product Hunt, r/SideProject
- **Buying trigger:** "I need a customer support agent for my SaaS by Friday"

### Secondary: The Small Agency Owner (Maria, 35)

- **Profile:** Runs a digital agency with 5-15 clients, offering "AI solutions"
- **Technical level:** Non-technical or semi-technical, relies on templates and no-code tools
- **Motivation:** Needs to deliver AI agents to clients without building from scratch each time
- **Budget:** $99-199 per template, buys 3-5 templates per month
- **Where they are:** LinkedIn, agency Slack communities, AI Twitter
- **Buying trigger:** "Client wants a content generation pipeline — I need it yesterday"

### Tertiary: The Developer Exploring Agents (Sam, 24)

- **Profile:** Software engineer curious about AI agents, wants to learn by example
- **Technical level:** Strong developer, new to agent architectures
- **Motivation:** Learn production agent patterns, not just toy examples
- **Budget:** $29-49 for learning-oriented templates
- **Where they are:** GitHub, Dev.to, YouTube tutorials, Discord communities
- **Buying trigger:** "I want to see how a real production agent is structured"

### Market Sizing

| Segment | Size | Accessible | Conversion | Revenue Potential |
|---|---|---|---|---|
| Indie hackers building with AI | ~500K globally | 50K (via channels) | 2% | 1,000 buyers |
| Digital agencies offering AI | ~100K globally | 10K (via LinkedIn/communities) | 3% | 300 buyers |
| Developers learning agents | ~2M globally | 200K (via GitHub/content) | 0.5% | 1,000 buyers |
| **Total addressable** | | **260K** | | **2,300 buyers** |

At $79 average order value: **$182K annual revenue potential** from initial audience alone.

---

## 4. Template Categories

### Launch Categories (Day 1 — 8 templates)

#### Category 1: Customer Support Agents

| Template | Description | Price | Complexity |
|---|---|---|---|
| **SupportBot Pro** | Full customer support agent with ticket triage, FAQ answering, escalation rules, sentiment detection, and CSAT collection | $99 | Medium |
| **Helpdesk Copilot** | Internal helpdesk agent for IT/HR — handles password resets, leave requests, policy questions with Slack/Teams integration | $79 | Medium |

**Includes:** Conversation memory schema, escalation decision trees, tone guidelines, integration configs for Intercom/Zendesk/Slack, test conversation sets (50+ scenarios).

#### Category 2: Content Generation Agents

| Template | Description | Price | Complexity |
|---|---|---|---|
| **ContentPipeline** | Multi-step content agent: research → outline → draft → edit → publish. Supports blog posts, newsletters, social threads | $149 | High |
| **SocialScheduler** | Social media agent that generates platform-specific content (Twitter threads, LinkedIn posts, Instagram captions) from a single brief | $79 | Medium |

**Includes:** Style guide templates, brand voice configuration, editorial workflow prompts, content calendar integration, quality scoring rubrics.

#### Category 3: Data Processing Agents

| Template | Description | Price | Complexity |
|---|---|---|---|
| **DataEntry Automator** | Extracts structured data from PDFs, invoices, receipts, emails. Outputs to CSV/JSON/database | $99 | Medium |
| **LeadEnricher** | Takes a list of company names/domains, enriches with firmographic data (size, industry, tech stack, contacts) via web scraping + APIs | $129 | High |

**Includes:** Data validation schemas, error handling for messy inputs, output format templates, retry logic, confidence scoring.

#### Category 4: Developer Productivity Agents

| Template | Description | Price | Complexity |
|---|---|---|---|
| **CodeReviewer** | Automated code review agent: style checks, bug detection, security scanning, PR summaries. Integrates with GitHub Actions | $79 | Medium |
| **DocGenerator** | Reads codebase, generates API docs, README files, architecture diagrams, and onboarding guides | $79 | Medium |

**Includes:** Language-specific rule sets, review checklist configs, GitHub integration, output templates.

### Phase 2 Categories (Month 2 — 8 more templates)

| Category | Templates | Target Audience |
|---|---|---|
| **Sales & Outreach** | Cold email agent, lead qualifier, demo scheduler | Sales teams, agencies |
| **Research & Analysis** | Competitive intelligence, market research, academic paper analyzer | Analysts, consultants |
| **Operations** | Meeting summarizer, project status reporter, daily standup bot | Remote teams |
| **E-commerce** | Product description writer, review responder, inventory alerter | Shopify/e-commerce owners |

### Phase 3: Community Marketplace (Month 3+)

Open the marketplace to third-party template creators. Revenue split: 70% creator / 30% platform.

---

## 5. Marketplace Features

### MVP Features (Month 1)

#### F-001: Template Catalog & Discovery

- Browse templates by category, framework, price, complexity, rating
- Search with natural language ("I need an agent that handles refund requests")
- Template detail page: description, screenshots, demo video, included files, reviews, version history
- "Compatible with" badges: OpenClaw, Claude Code, LangGraph, CrewAI
- Complexity indicator: Beginner / Intermediate / Advanced

#### F-002: Purchase & Download

- One-click purchase via Stripe (credit card, Apple Pay, Google Pay)
- Instant download as ZIP after payment
- Purchase receipt via email with download link (valid 30 days)
- License: per-user, unlimited projects (no per-project licensing)
- Download history in user dashboard

#### F-003: Template Preview

- README and CUSTOMIZE.md visible before purchase
- File tree view showing what's included
- 3 sample files viewable (e.g., SOUL.md, one tool config, one test)
- Demo video or GIF showing the agent in action
- "Try before you buy" — free limited version of 2 templates

#### F-004: User Accounts & Dashboard

- Sign up with GitHub or email (Supabase Auth)
- Purchase history with re-download links
- Template update notifications (when a purchased template gets a new version)
- Saved/favorited templates
- Basic profile (for future marketplace seller accounts)

#### F-005: Rating & Reviews

- 1-5 star rating after purchase
- Written review with "Verified Purchase" badge
- Seller response to reviews
- Average rating displayed on catalog cards
- Sort by rating, newest, most popular

### Phase 2 Features (Month 2)

| Feature | Description |
|---|---|
| **Template Bundles** | Buy 3+ templates at 20% discount ("Customer Success Bundle," "Agency Starter Kit") |
| **Version Updates** | Free updates to purchased templates; notification when new version drops |
| **Customization Wizard** | Interactive form that pre-fills template configs (company name, tone, tools, etc.) |
| **Seller Portal** | Third-party creators can submit templates for review and listing |
| **Affiliate Program** | 20% commission for referrals; tracking via unique links |

### Phase 3 Features (Month 3+)

| Feature | Description |
|---|---|
| **Subscription Tier** | $49/mo for access to all templates + monthly new releases |
| **Enterprise Licensing** | Team licenses, SSO, private template library |
| **Template Forking** | Buy a template, customize, re-sell as a variant (with attribution) |
| **Live Agent Playground** | Test templates in a sandboxed environment before purchase |
| **Integration Hub** | One-click deploy to Vercel, Railway, Docker, OpenClaw |

---

## 6. Pricing Model

### Template Pricing (One-Time Purchase)

| Tier | Price Range | What's Included | Target Buyer |
|---|---|---|---|
| **Starter** | $29-49 | Single-purpose agent, basic tools, minimal customization | Developers learning agents |
| **Professional** | $79-129 | Production-ready agent, full tool suite, deployment configs, tests | Indie hackers, small teams |
| **Enterprise** | $149-199 | Complex multi-agent system, advanced integrations, premium support | Agencies, businesses |

### Bundle Pricing

| Bundle | Contents | Price | Savings |
|---|---|---|---|
| **Agency Starter Kit** | 4 Professional templates (Support + Content + Data + Code Review) | $279 | 22% off |
| **Full Collection** | All 8 launch templates | $499 | 30% off |

### Subscription Model (Phase 3)

| Plan | Price | Includes |
|---|---|---|
| **Free** | $0 | Browse catalog, 2 free starter templates, community access |
| **Pro** | $49/mo | All templates (current + new releases), priority updates, Discord support |
| **Team** | $149/mo | Pro + 5 seats, shared template library, priority customization support |
| **Enterprise** | Custom | Team + SSO, custom templates, dedicated support, SLA |

### Revenue Projections — Path to $5K MRR

| Month | Revenue Stream | Units/Subs | Avg Price | Monthly Revenue |
|---|---|---|---|---|
| **Month 1** | Template sales (one-time) | 40 templates | $89 | $3,560 |
| **Month 2** | Template sales + bundles | 55 templates | $95 | $5,225 |
| **Month 3** | Templates + subscriptions | 30 templates + 40 subs | $89 / $49 | $4,630 |
| **Month 3 total** | Combined | | | **$4,630** |
| **Month 4** | Templates + subs + marketplace | 25 + 60 subs + 10% marketplace | | **$5,500+** |

**$5K MRR achievable by Month 3-4** through combination of one-time sales momentum and subscription conversion.

### Key Assumptions

- Conversion rate on landing page: 3-5%
- Average template price: $89
- Bundle attach rate: 15% of buyers upgrade to bundle
- Subscription conversion: 20% of one-time buyers convert within 60 days
- Refund rate: <5% (30-day money-back guarantee)

---

## 7. Competitive Landscape

### Direct Competitors

| Competitor | Model | Strengths | Weaknesses | Our Angle |
|---|---|---|---|---|
| **PromptBase** | Prompt marketplace | Established brand, 100K+ prompts | Just prompts, no architecture, no tools, no deployment | Complete agent packages, not just prompts |
| **GPT Store (OpenAI)** | Free GPTs | Massive distribution, zero cost | Locked to ChatGPT, no code access, can't self-host, limited tools | Framework-agnostic, full source code, self-hosted |
| **LangChain Hub** | Free templates | Open-source community | Unmaintained, tutorial-quality, no curation | Production-tested, maintained, supported |
| **Agent.ai** | Agent marketplace | Growing ecosystem | Agents as services (not templates), no customization | Buy the blueprint, own the agent |

### Indirect Competitors

| Competitor | Overlap | Why We're Different |
|---|---|---|
| **Fiverr/Upwork** | Hire someone to build an agent | $2K-10K vs. $29-199; instant vs. weeks |
| **GitHub repos** | Free agent templates | Unmaintained, untested, no support |
| **YouTube tutorials** | Learn to build agents | Educational, not production-ready |
| **AI consulting firms** | Custom agent builds | $50K+ engagements vs. self-service templates |

### Our Moat (Over Time)

1. **Quality curation** — Every template tested monthly, version-tracked, documented
2. **Framework coverage** — OpenClaw + Claude Code + LangGraph + CrewAI under one roof
3. **Community marketplace** — Network effects as sellers and buyers grow
4. **Brand trust** — "If it's on AgentVault, it works"

---

## 8. Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | SSR marketplace pages, SEO, fast navigation |
| **React 19** | UI components |
| **Tailwind CSS v4** | Styling — warm, humanist design (not generic blue) |
| **shadcn/ui** | Component library base |
| **Framer Motion** | Micro-interactions, page transitions |

### Backend

| Technology | Purpose |
|---|---|
| **Supabase** | Auth (GitHub + email), PostgreSQL database, storage (template ZIPs), Edge Functions |
| **Stripe** | Payments — one-time purchases, subscriptions, seller payouts |
| **Vercel** | Hosting, edge functions, analytics |
| **Resend** | Transactional emails (receipts, updates, password reset) |

### Database Schema (Core Tables)

```sql
-- Templates
templates (
  id uuid PK,
  slug text UNIQUE,
  title text,
  description text,
  long_description text,  -- markdown
  category text,           -- support, content, data, devtools
  framework text[],        -- ['openclaw', 'claude-code', 'langgraph']
  complexity text,         -- beginner, intermediate, advanced
  price_cents int,
  creator_id uuid FK,
  version text,
  file_url text,           -- Supabase Storage path
  preview_files jsonb,     -- files visible before purchase
  demo_url text,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz
)

-- Purchases
purchases (
  id uuid PK,
  user_id uuid FK,
  template_id uuid FK,
  stripe_payment_id text,
  amount_cents int,
  purchased_at timestamptz,
  download_count int DEFAULT 0
)

-- Reviews
reviews (
  id uuid PK,
  user_id uuid FK,
  template_id uuid FK,
  purchase_id uuid FK,     -- verified purchase
  rating int CHECK (1-5),
  comment text,
  seller_response text,
  created_at timestamptz
)

-- Users
profiles (
  id uuid PK,
  email text,
  display_name text,
  avatar_url text,
  github_username text,
  is_seller boolean DEFAULT false,
  stripe_customer_id text,
  stripe_connect_id text,  -- for seller payouts
  created_at timestamptz
)

-- Bundles
bundles (
  id uuid PK,
  slug text UNIQUE,
  title text,
  description text,
  template_ids uuid[],
  price_cents int,
  discount_pct int,
  is_published boolean
)
```

### Infrastructure Costs (Projected)

| Service | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| Vercel Pro | $20 | $20 | $20 |
| Supabase Pro | $25 | $25 | $25 |
| Stripe fees (2.9% + 30c) | ~$110 | ~$200 | ~$300 |
| Resend | $0 (free tier) | $20 | $20 |
| Domain | ~$1 | ~$1 | ~$1 |
| **Total** | **~$156** | **~$266** | **~$366** |

Margins: ~95% at $5K MRR.

---

## 9. Distribution Strategy

### Channel 1: Content Marketing (Primary — Weeks 1-4)

| Content Type | Cadence | Distribution | Purpose |
|---|---|---|---|
| "How to Build a ___ Agent" blog posts | 2/week | Blog (SEO), Dev.to, Hashnode | Attract developers searching for agent guides |
| YouTube walkthroughs | 1/week | YouTube, Twitter clips | Show templates in action, build trust |
| Twitter/X threads | 3/week | @AgentVault | Agent building tips, template showcases |
| Reddit posts | 2/week | r/SideProject, r/MachineLearning, r/ClaudeAI | Educational posts with soft template mentions |

**SEO targets:** "claude code agent template," "ai agent template," "customer support chatbot template," "openai agent boilerplate," "langgraph template"

### Channel 2: Community & Partnerships (Weeks 2-6)

| Partner | Integration | Expected Impact |
|---|---|---|
| **OpenClaw** | Listed in official skill directory; co-marketed | 500+ developer eyeballs |
| **Claude Code community** | Templates optimized for Claude Code workflows | Primary audience alignment |
| **Indie Hackers** | Sponsored post + community engagement | 200+ landing page visits |
| **Product Hunt** | Launch campaign (Month 2) | 500-1K signups on launch day |
| **Dev YouTube channels** | Sponsor 2-3 mid-tier channels (5-50K subs) | $500-1K spend, 10K+ views |

### Channel 3: Free Templates as Lead Magnets (Week 1+)

- 2 free "Starter" templates available without purchase
- Require email signup to download
- Email sequence: free template → tips → showcase paid templates → bundle offer
- Expected: 500 email signups/month, 5% conversion to paid = 25 sales/month from this alone

### Channel 4: Affiliate Program (Month 2+)

- 20% commission on referred sales (first purchase only)
- Target: AI newsletter authors, YouTube creators, Twitter influencers
- Provide custom landing pages with affiliate tracking
- Expected: 30% of Month 3+ revenue from affiliates

### Launch Sequence

```
Week 1: Soft launch — 2 free templates, email capture, Twitter announcement
Week 2: Full catalog live (8 templates), blog content engine starts
Week 3: Community outreach (OpenClaw, Discord, Reddit), first YouTube video
Week 4: Product Hunt launch, affiliate program opens, bundle pricing
Week 5-8: Content flywheel, partnerships, seller portal beta
Week 9-12: Subscription model launch, community marketplace beta
```

---

## 10. User Flows

### Flow 1: First-Time Buyer

```
Google "customer support agent template" → Blog post (SEO)
→ CTA: "Get the production-ready version"
→ Template detail page:
    - Video demo (30s)
    - File tree preview
    - 3 sample files readable
    - Reviews (4.7 stars, 23 reviews)
    - "Buy for $99" button
→ Sign up (GitHub OAuth — 1 click)
→ Stripe Checkout → Payment
→ Download page (ZIP + setup instructions)
→ Email: Receipt + quickstart link + "Need help? Join Discord"
→ 3 days later: "How's your agent going?" email
→ 7 days later: "You might also like..." bundle offer
```

### Flow 2: Bundle Purchase

```
Landing page → Browse catalog → Click "Customer Support Agent" ($99)
→ Banner: "Save 22% with the Agency Starter Kit — 4 templates for $279"
→ Click bundle → Bundle detail page (shows all 4 templates)
→ Purchase → Download all 4 as separate ZIPs
```

### Flow 3: Template Seller (Phase 2)

```
Seller dashboard → "Submit Template" → Upload ZIP
→ Automated checks: required files present, README quality, test coverage
→ Manual review by AgentVault team (48h SLA)
→ Approved → Listed in catalog
→ Buyer purchases → 70% deposited to seller Stripe Connect
→ Seller dashboard: earnings, downloads, reviews, version management
```

---

## 11. Design Direction

- **Mood:** Developer tool meets premium marketplace — Linear meets Gumroad
- **Theme:** Dark mode default, light mode available
- **Palette:** Warm neutral background, amber/gold accents, high-contrast text
- **Typography:** Monospace for code previews, clean sans-serif for UI
- **References:**
  - Linear (clean developer tool aesthetic)
  - Gumroad (creator-friendly marketplace)
  - Tailwind UI (documentation quality)
  - Raycast Store (curated extensions marketplace)
- **Anti-patterns:**
  - No generic SaaS blue
  - No cluttered marketplace grid (think curated, not Amazon)
  - No stock photos — use code screenshots and terminal recordings
  - No enterprise-y gradients or illustrations

---

## 12. Success Metrics

### North Star Metric

**Monthly Recurring Revenue (MRR)** — Target: $5K by Month 4.

### Key Performance Indicators

| Category | Metric | Month 1 Target | Month 3 Target |
|---|---|---|---|
| Acquisition | Unique visitors/month | 5,000 | 15,000 |
| Acquisition | Email signups | 500 | 2,000 |
| Conversion | Visitor → Purchase | 1.5% | 3% |
| Revenue | Template sales | $3,500 | $5,000+ |
| Revenue | Average order value | $89 | $95 (bundle lift) |
| Engagement | Templates downloaded/buyer | 1.2 | 1.8 |
| Retention | Repeat purchase rate (60d) | 15% | 25% |
| Quality | Average template rating | 4.5+ | 4.5+ |
| Quality | Refund rate | <5% | <3% |

### Kill/Keep Decision (Day 14)

| Signal | Metric |
|---|---|
| **Keep building** | 15+ organic sales in first 2 weeks |
| **Keep building** | 3+ unsolicited positive reviews |
| **Keep building** | 2+ people ask "when are you adding ___?" |
| **Pivot** | <5 sales despite 1K+ landing page visits (product issue) |
| **Kill** | <200 landing page visits despite content push (distribution issue) |

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Templates become commoditized (free alternatives flood market) | High | High | Focus on quality, maintenance, support, and community trust — free repos don't get monthly updates |
| Low initial traffic | Medium | High | Start with 2 free lead-magnet templates + aggressive content marketing before paid launch |
| Framework churn (new agent framework replaces current ones) | Medium | Medium | Multi-framework support from Day 1; templates are architecture patterns, not framework-locked |
| Template piracy (shared after purchase) | Medium | Low | License enforcement impractical at this scale; focus on updates + support as value |
| Bad reviews from confused buyers | Medium | Medium | Clear complexity labels, detailed previews, 30-day refund policy |
| Seller marketplace quality control | Medium | High | Manual review process, strict quality checklist, buyer-funded trust |

---

## 14. Open Questions

| # | Question | Status | Notes |
|---|---|---|---|
| 1 | Brand name — AgentVault vs. alternatives? | Open | Candidates: AgentVault, AgentKit, TemplateAgents, AgentForge |
| 2 | Domain? | Open | Check availability for shortlisted names |
| 3 | Should free tier include 1 or 2 templates? | Leaning 2 | More generous = more email signups |
| 4 | Seller marketplace timeline — Month 2 or Month 3? | Open | Depends on organic demand for seller slots |
| 5 | Which framework to prioritize — OpenClaw or Claude Code? | Leaning Claude Code | Larger community, but OpenClaw is our ecosystem |
| 6 | Subscription vs. one-time — which drives more revenue long-term? | Open | Start one-time, add subscription when catalog hits 15+ templates |

---

## 15. 30-Day Launch Plan

### Week 1: Foundation (Days 1-7)

| Day | Task | Owner | Deliverable |
|---|---|---|---|
| 1-2 | Set up Next.js project, Supabase, Stripe integration | Kato (CLI agent) | Scaffold deployed to Vercel |
| 1-2 | Write first 2 templates (SupportBot Pro, ContentPipeline) | Kato | Complete template packages |
| 3-4 | Build template catalog page, detail page, purchase flow | Kato (CLI agent) | Core marketplace functional |
| 5 | Build download system (Supabase Storage + signed URLs) | Kato (CLI agent) | Purchase → download works end-to-end |
| 6 | Design spec + polish (warm theme, not generic) | Kato | Design aligned with brand |
| 7 | Write remaining 6 launch templates | Kato | All 8 templates complete |

**Week 1 Exit Criteria:** 8 templates built, marketplace functional, purchase flow working end-to-end.

### Week 2: Content & Soft Launch (Days 8-14)

| Day | Task | Owner | Deliverable |
|---|---|---|---|
| 8 | Write 2 SEO blog posts ("How to Build a Customer Support Agent") | Kato | Published to blog |
| 9 | Record 1 YouTube walkthrough video | Xavier | Published to YouTube |
| 10 | Soft launch: publish 2 free templates, start email capture | Kato | Landing page live with free downloads |
| 11 | Reddit posts (r/SideProject, r/ClaudeAI) | Kato | 2 posts with organic engagement |
| 12 | Twitter/X launch thread | Xavier | Thread posted from personal account |
| 13 | Enable paid catalog (all 8 templates live) | Kato | Full marketplace live |
| 14 | **Day 14 Kill/Keep check** | Xavier + Kato | Decision on continued investment |

**Week 2 Exit Criteria:** Marketplace live, 2 free templates driving email signups, first paid sales.

### Week 3: Growth (Days 15-21)

| Day | Task | Owner | Deliverable |
|---|---|---|---|
| 15-16 | Write 2 more SEO blog posts | Kato | Published |
| 17 | Reach out to 5 AI newsletter authors for affiliate/feature | Kato | 5 outreach emails sent |
| 18 | Submit to OpenClaw skill directory | Kato | Listed in directory |
| 19 | Add bundle pricing | Kato (CLI agent) | Bundles purchasable |
| 20-21 | Iterate on templates based on buyer feedback | Kato | Updated template versions |

**Week 3 Exit Criteria:** Content flywheel running, partnership pipeline started, bundles live.

### Week 4: Scale (Days 22-30)

| Day | Task | Owner | Deliverable |
|---|---|---|---|
| 22-23 | Product Hunt launch prep (assets, copy, supporters) | Xavier + Kato | Launch page ready |
| 24 | **Product Hunt launch day** | Xavier | Featured on PH |
| 25-26 | Handle PH traffic spike, onboard new buyers | Kato | Sales processed, emails sent |
| 27-28 | Launch affiliate program | Kato (CLI agent) | Affiliate tracking live |
| 29 | Write 2 new templates based on top requested categories | Kato | Catalog expanded to 10 |
| 30 | **Month 1 review** — revenue, metrics, next month plan | Xavier + Kato | Decision document |

**Week 4 Exit Criteria:** Product Hunt launched, affiliate program live, 10 templates in catalog, $3K+ month 1 revenue.

---

## 16. Approval & Sign-off

| Role | Name | Status |
|---|---|---|
| Product Owner | Xavier Liew | Pending |
| Engineering Lead | Kato (AI) | Pending |
| Business Lead | Xavier Liew | Pending |

---

*Document Owner: Kato*
*Last Updated: February 11, 2026*
*Next Review: After Day 14 kill/keep decision*
