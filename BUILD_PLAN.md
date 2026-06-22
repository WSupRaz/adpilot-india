# AdPilot India — CTO Build Plan

**Version:** 1.0  
**Date:** 2026-06-19  
**Author:** CTO / Lead Product Architect  
**Status:** Pre-Development Blueprint

---

## Table of Contents

1. [Business Analysis](#1-business-analysis)
2. [Identified Weaknesses & Risks](#2-identified-weaknesses--risks)
3. [Strategic Improvements](#3-strategic-improvements)
4. [Technical Architecture](#4-technical-architecture)
5. [Database Schema](#5-database-schema)
6. [Folder Structure](#6-folder-structure)
7. [MVP Roadmap](#7-mvp-roadmap)
8. [What to Build First](#8-what-to-build-first)

---

## 1. Business Analysis

### What This Is

AdPilot India is an AI-powered marketing SaaS that replaces the role of a marketing agency for Indian SMBs. The platform ingests plain-language business descriptions (Hindi/Hinglish/English) and outputs professional-grade ad campaigns, audits, creatives, competitor intelligence, WhatsApp automations, and growth plans — with no marketing knowledge required from the user.

### Market Opportunity

- 63 million+ MSMEs in India, fewer than 2% run paid digital ads
- Marketing agencies charge ₹15,000–₹50,000/month — unaffordable for 95% of SMBs
- Vernacular-first (Hindi/Hinglish) is virtually untouched in marketing SaaS
- WhatsApp penetration in India: 500M+ users — native to how SMBs already communicate
- Festival-driven commerce cycles (Diwali, Wedding Season, IPL) are uniquely Indian and underserved by global tools

### Core Value Proposition

Users do not buy campaigns. They buy outcomes: leads, calls, bookings, revenue. Every screen, prompt, and output must anchor to a business result, never a marketing concept.

---

## 2. Identified Weaknesses & Risks

### 2.1 Critical Blockers (Must Resolve Before Launch)

**RISK 1 — Google Ads & Meta Ads API Approval**  
Severity: CRITICAL  
Both Google Ads API and Meta Marketing API require formal application, business verification, and policy review before granting production access. This process takes 4–12 weeks. Without approval, the core campaign builder cannot publish ads. Mitigation: Apply immediately; build the MVP in "draft mode" (generate campaigns for user review, require manual publish) so the product is usable while API access is pending.

**RISK 2 — WhatsApp Business API (WABA) Compliance**  
Severity: HIGH  
Meta requires Business Manager verification, approved message templates, and Indian phone number compliance for WABA. Green-tick verification adds another 4–8 weeks. WhatsApp cannot be part of MVP. Use Gupshup sandbox for demos only.

**RISK 3 — AI Budget Destruction Risk**  
Severity: CRITICAL  
If AI auto-publishes a campaign with wrong targeting or inflated bids, an SMB's ₹500/day budget can be destroyed in hours. This is a trust-ending, possibly legal, event. Mitigation: No auto-publishing in Phase 1. All campaigns require explicit user approval before going live. Build a mandatory "human-in-the-loop" checkpoint.

**RISK 4 — Ad Platform Policy Violations at Scale**  
Severity: HIGH  
Google and Meta use automated systems that flag accounts generating high volumes of ads via APIs. Mass AI-generated ad copy can trigger trademark violations, misleading claims flags, or account suspensions. Mitigation: Build a pre-submission policy check layer using AI that validates copy against platform guidelines before surfacing it to users.

### 2.2 Architectural Risks

**RISK 5 — Scope is 3x Too Large for MVP**  
The brief specifies 6 modules + 10 proprietary engines simultaneously. Attempting to build all of this in parallel will produce nothing shippable. The AI Growth Manager (Module 6) is described as "most important" but depends on all other modules working first. Mitigation: Hard sequence these behind a gate system. See MVP Roadmap.

**RISK 6 — Multi-LLM Provider Complexity**  
Supporting GPT, Claude, Gemini, and OpenRouter simultaneously with auto-fallback is a significant engineering surface. Each provider has different token limits, rate limits, pricing, capability profiles, and API shapes. Building a naive abstraction layer will produce mediocre results from all four. Mitigation: Build a proper AI Router Service with model-specific prompt templates, not a single generic wrapper.

**RISK 7 — SEO/Audit Crawler is Infrastructure, Not a Feature**  
A real marketing audit (Core Web Vitals, broken links, schema validation, redirect chains, canonical issues) requires a full headless browser crawler. This cannot be built with AI alone. Using only AI without a crawler produces hallucinated audits that will fail on real websites. Mitigation: Integrate Lighthouse CI API + a lightweight crawler (Playwright-based) in Phase 2. Phase 1 audit is "AI analysis only" with a clear disclaimer.

**RISK 8 — Competitor Intelligence Has Legal Gray Areas**  
Scraping competitor websites may violate their ToS. Using SimilarWeb/SpyFu API data requires licensing. Mitigation: Use only public data (Google Search results, Meta Ad Library API which is free and legal, public social profiles). Disclose data sources clearly in UI.

**RISK 9 — No Credit/Metering System Designed**  
Every AI call costs real money. Without a credit system, a single enterprise user can exhaust your OpenAI budget in a day. The brief mentions "AI Usage" in the admin panel but no credit architecture is defined. This must be designed before any module is built.

**RISK 10 — India Tax Compliance (GST)**  
Razorpay integration for Indian businesses requires GST invoicing. Subscription SaaS is subject to 18% GST. Missing this in billing architecture will create legal exposure at scale. Mitigation: Design invoicing with GST from day one.

### 2.3 Product Risks

**RISK 11 — Onboarding Friction**  
The target user (saree shop owner in Bhopal) has never used SaaS. A traditional onboarding flow will produce massive drop-off. The product must feel like a WhatsApp conversation, not a dashboard form. Mitigation: Build a conversational onboarding wizard as the first screen post-signup.

**RISK 12 — Hindi/Hinglish NLP is Harder Than It Looks**  
Indian language processing with mixed-script Hinglish ("meri shop hai Bhopal mein") degrades the performance of all major LLMs. GPT-4o handles it best; Claude 3.5 Sonnet is second. Gemini Flash is good for Indian languages specifically. Mitigation: Route Indian-language inputs specifically to models with best Hindi performance, not just cheapest model.

---

## 3. Strategic Improvements

### 3.1 Reframe the Architecture Around a "Marketing OS"

Instead of 6 isolated modules, build a unified data model where every module feeds a central **Business Intelligence Graph** per user. When a user runs an audit, those findings automatically improve their campaign suggestions. When WhatsApp leads come in, they inform the Growth Manager's lead cost estimates. Modules must share data, not operate in silos.

### 3.2 Add a Mandatory Human-in-the-Loop Layer

Every AI output that can affect money must pass through an "Approve Before Publishing" gate. Design this as a first-class UI pattern — not an afterthought. The user sees what the AI created, why it made those choices, what it expects to happen, and then approves or modifies. This is both a safety mechanism and a trust-building UX.

### 3.3 India Intelligence Layer Must Be a Database, Not Just Prompts

The "India Intelligence Layer" (festivals, seasons, tier cities) described in the brief is mentioned as a system prompt addition. That is too fragile. Build it as a structured database table with seasonal multipliers, category-specific playbooks, and city-tier behavioral profiles. This becomes a queryable, auditable, improvable dataset — the actual competitive moat.

### 3.4 Credit Economy as a First-Class System

Design a unified credit system before writing Module 1. Credits are consumed by every AI action. This enables:
- Metered billing (pay-as-you-go layer on top of subscriptions)
- Fair-use enforcement per plan tier
- Admin visibility into AI cost per user
- Future marketplace for "credit top-ups"

One credit = one AI operation unit (1 campaign generation = 10 credits, 1 audit = 25 credits, etc.)

### 3.5 Add "Agency Mode" to Phase 2, Not Phase 3

Indian digital marketing agencies are the fastest path to scale — one agency managing 50 clients multiplies your revenue 50x. Build multi-client workspace (the "Agency Dashboard") in Phase 2, not Phase 3. This is a $10K/month ticket size opportunity.

### 3.6 Pricing Model Recommendation

| Plan | Price | Target | Key Limits |
|------|-------|--------|------------|
| Starter | ₹999/mo | Solo business owner | 1 business, 50 credits/mo, 2 campaigns |
| Growth | ₹2,999/mo | Growing SMB | 3 businesses, 200 credits/mo, 10 campaigns |
| Agency | ₹7,999/mo | Marketing agency | 25 clients, 1000 credits/mo, unlimited campaigns |
| Enterprise | Custom | Enterprise/Franchise | Unlimited, white-label, API access |

Annual plans: 2 months free (16% discount). This anchors Indian SMBs who respond to "save money" framing.

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  Next.js Web App    Mobile Web (PWA)    Admin Panel          │
└──────────────────┬──────────────────────────────────────────┘
                   │  HTTPS / REST + WebSocket
┌──────────────────▼──────────────────────────────────────────┐
│                   API GATEWAY (Express)                       │
│  Rate Limiting │ Auth Middleware │ Request Logging            │
└────┬──────────────────┬─────────────────────┬───────────────┘
     │                  │                     │
┌────▼────┐      ┌──────▼──────┐      ┌───────▼───────┐
│  Auth   │      │  Core API   │      │  Admin API    │
│ Service │      │  Services   │      │  Service      │
└────┬────┘      └──────┬──────┘      └───────┬───────┘
     │                  │                     │
     └──────────────────┼─────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    SERVICE LAYER                              │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Campaign   │  │  Audit     │  │ Creative   │            │
│  │ Service    │  │  Service   │  │ Service    │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │                    │
│  ┌─────▼──────┐  ┌──────▼─────┐  ┌─────▼──────┐           │
│  │ Competitor │  │ WhatsApp   │  │ Growth     │            │
│  │ Service    │  │ Service    │  │ Service    │            │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │           AI ROUTER SERVICE                   │          │
│  │  GPT-4o │ Claude Sonnet │ Gemini │ OpenRouter │         │
│  │  Prompt Manager │ Fallback Logic │ Cost Meter │         │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │         INDIA INTELLIGENCE ENGINE             │          │
│  │  Festival DB │ City Tier Profiles │ Playbooks │         │
│  └──────────────────────────────────────────────┘          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                        │
│                                                              │
│  PostgreSQL (Supabase) │ Redis (BullMQ + Cache)              │
│  Cloudflare R2 (Storage) │ Sentry (Errors)                   │
│  PostHog (Analytics) │ Resend (Email)                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Frontend Architecture

**Framework:** Next.js 14 with App Router  
**Language:** TypeScript (strict mode)  
**Styling:** Tailwind CSS + Shadcn UI  
**State:** Zustand (global) + React Query (server state)  
**Forms:** React Hook Form + Zod  
**Charts:** Recharts  
**PDF Export:** react-pdf  
**Toasts:** Sonner  
**Animation:** Framer Motion  

**Key Architectural Decisions:**
- App Router with server components for all data-fetching pages
- Client components only for interactive UI (forms, dashboards)
- API routes in Next.js only for BFF (Backend-for-Frontend) pattern — all business logic stays in Express backend
- Internationalization via next-intl (English, Hindi, Hinglish UI labels)
- PWA manifest for mobile-first experience

### 4.3 Backend Architecture

**Runtime:** Node.js 20 LTS  
**Framework:** Express 5 + TypeScript  
**ORM:** Prisma (with Supabase PostgreSQL)  
**Queue:** BullMQ + Redis (for AI jobs — async, retriable, observable)  
**Cache:** Redis (API response cache, session cache)  
**Email:** Resend  
**File Storage:** Cloudflare R2 via AWS SDK  
**Auth:** JWT (access token 15min) + Refresh Token (30 days) in httpOnly cookie  
**Validation:** Zod on all inputs  
**Logging:** Winston + structured JSON logs  
**Monitoring:** Sentry  

**API Design Principles:**
- REST with consistent response envelope: `{ success, data, error, meta }`
- Versioned routes: `/api/v1/`
- All AI operations are async — POST to start, GET to poll, WebSocket for real-time updates
- Every endpoint has rate limiting via `express-rate-limit` + Redis store
- Idempotency keys on all mutation endpoints

### 4.4 AI Router Architecture

The AI Router is the most critical service. It must be designed as a proper abstraction, not a simple if/else.

```
AI Router Service
├── PromptRegistry         — versioned, parameterized prompt templates per task
├── ModelSelector          — picks model based on task type + language + cost budget
├── ProviderAdapters       — GPT, Claude, Gemini, OpenRouter (each with own adapter)
├── FallbackChain          — ordered retry list per task type
├── CostMeter              — calculates and records token cost per call
├── ResponseValidator      — validates AI output against expected schema (Zod)
├── ResponseCache          — Redis-based cache for identical inputs (saves cost)
└── UsageLogger            — writes to ai_usage_logs table for admin visibility
```

**Model Selection Logic:**

| Task | Primary | Fallback 1 | Fallback 2 |
|------|---------|------------|------------|
| Campaign Generation | Claude Sonnet 4.6 | GPT-4o | Gemini 2.0 Flash |
| Hindi/Hinglish Input | Gemini 2.0 Flash | GPT-4o | Claude Sonnet |
| Audit Analysis | GPT-4o | Claude Sonnet 4.6 | Gemini |
| Creative Ideation | Claude Sonnet 4.6 | GPT-4o | OpenRouter |
| Competitor Analysis | GPT-4o | Claude Sonnet 4.6 | Gemini |

### 4.5 Job Queue Architecture

All AI operations run as background jobs. The UI polls or subscribes via WebSocket.

```
Job Queues (BullMQ + Redis):
├── ai:campaign-generate    — priority: high, concurrency: 5
├── ai:audit-analyze        — priority: medium, concurrency: 3
├── ai:creative-generate    — priority: medium, concurrency: 5
├── ai:competitor-analyze   — priority: low, concurrency: 2
├── ai:growth-plan          — priority: high, concurrency: 3
├── pdf:report-generate     — priority: low, concurrency: 2
├── whatsapp:send           — priority: critical, concurrency: 10
└── email:notifications     — priority: low, concurrency: 5
```

Each job has:
- Retry logic: 3 attempts with exponential backoff
- Dead letter queue for failed jobs
- Progress events emitted via Redis pub/sub → WebSocket to frontend
- Job result stored in DB after completion

### 4.6 Security Architecture

**Authentication:**
- JWT access tokens (15-minute TTL, signed with RS256)
- Refresh tokens stored in httpOnly secure cookies (30-day TTL)
- Google OAuth via Passport.js
- OTP via Resend (email) or MSG91 (SMS) — 6-digit, 10-minute expiry
- All auth tokens hashed (bcrypt) before DB storage

**Authorization:**
- Role-Based Access Control (RBAC): `owner`, `admin`, `member`, `viewer`
- Resource-level permissions: businesses, campaigns, team members
- Every API route checks both authentication AND authorization
- Admin panel uses separate auth domain and stricter role

**API Security:**
- All inputs validated with Zod before processing
- SQL injection impossible via Prisma parameterized queries
- XSS prevented via output encoding + Content Security Policy headers
- CSRF protection via sameSite cookie + origin validation
- Rate limiting: 100 req/15min per IP (unauthenticated), 500 req/15min per user
- Secrets stored in environment variables, never in code or DB

**Data Security:**
- All PII encrypted at rest (Supabase handles this)
- API keys for ad platforms stored encrypted (AES-256) in DB
- Payment card data never touches our servers (Razorpay/Stripe handle PCI compliance)
- GDPR-ready: soft deletes, data export endpoint, data deletion endpoint

### 4.7 External Integrations

| Integration | Purpose | Phase |
|-------------|---------|-------|
| Google Ads API | Create/manage Google campaigns | Phase 2 |
| Meta Marketing API | Create/manage Meta campaigns | Phase 2 |
| Meta Ad Library API | Competitor ad intelligence (free, legal) | Phase 1 |
| Razorpay | Indian payments + subscriptions | Phase 1 |
| Stripe | International payments | Phase 2 |
| WhatsApp Business API | WhatsApp agent | Phase 3 |
| Gupshup | WhatsApp sandbox/testing | Phase 2 |
| Resend | Transactional email | Phase 1 |
| MSG91 | SMS OTP for Indian numbers | Phase 1 |
| Cloudflare R2 | File/PDF storage | Phase 1 |
| PostHog | Product analytics | Phase 1 |
| Sentry | Error monitoring | Phase 1 |
| Lighthouse CI | Web audit metrics | Phase 2 |

---

## 5. Database Schema

**Database:** PostgreSQL 15 via Supabase  
**ORM:** Prisma  
**Conventions:**
- All IDs: UUID v4
- All timestamps: `created_at`, `updated_at` (auto-managed)
- Soft deletes: `deleted_at` nullable timestamp
- All money values: INTEGER in paise (₹1 = 100 paise) to avoid float precision issues

---

### Table: users

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  email_verified    BOOLEAN DEFAULT FALSE,
  phone             VARCHAR(20),
  phone_verified    BOOLEAN DEFAULT FALSE,
  password_hash     VARCHAR(255),                          -- null for OAuth users
  full_name         VARCHAR(255) NOT NULL,
  avatar_url        TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',             -- 'en', 'hi', 'hinglish'
  google_id         VARCHAR(255) UNIQUE,
  role              VARCHAR(20) DEFAULT 'user',            -- 'user', 'admin', 'superadmin'
  is_active         BOOLEAN DEFAULT TRUE,
  last_login_at     TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
```

---

### Table: businesses

```sql
CREATE TABLE businesses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,                                  -- plain-language description
  business_type     VARCHAR(100),                         -- 'retail', 'clinic', 'restaurant', etc.
  industry_category VARCHAR(100),
  website_url       TEXT,
  phone             VARCHAR(20),
  email             VARCHAR(255),
  
  -- Location
  address_line1     VARCHAR(255),
  city              VARCHAR(100),
  state             VARCHAR(100),
  pincode           VARCHAR(10),
  country           VARCHAR(10) DEFAULT 'IN',
  city_tier         SMALLINT,                             -- 1, 2, 3 (tier 1/2/3 city)
  latitude          DECIMAL(10, 8),
  longitude         DECIMAL(11, 8),
  
  -- Ad Account Connections
  google_ads_customer_id  VARCHAR(50),
  google_ads_connected_at TIMESTAMP WITH TIME ZONE,
  meta_ad_account_id      VARCHAR(50),
  meta_connected_at       TIMESTAMP WITH TIME ZONE,
  
  -- Business Intelligence
  target_audience   JSONB,                               -- AI-derived audience profile
  seasonal_profile  JSONB,                               -- which seasons matter most
  avg_monthly_budget INTEGER DEFAULT 0,                  -- in paise
  
  logo_url          TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_city ON businesses(city) WHERE deleted_at IS NULL;
```

---

### Table: plans

```sql
CREATE TABLE plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,               -- 'starter', 'growth', 'agency', 'enterprise'
  display_name      VARCHAR(100) NOT NULL,
  description       TEXT,
  
  -- Pricing (in paise)
  price_monthly     INTEGER NOT NULL,
  price_annual      INTEGER NOT NULL,
  
  -- Razorpay Plan IDs
  razorpay_plan_id_monthly  VARCHAR(100),
  razorpay_plan_id_annual   VARCHAR(100),
  stripe_price_id_monthly   VARCHAR(100),
  stripe_price_id_annual    VARCHAR(100),
  
  -- Limits
  max_businesses    INTEGER DEFAULT 1,
  credits_per_month INTEGER NOT NULL,
  max_campaigns     INTEGER DEFAULT 5,
  max_team_members  INTEGER DEFAULT 1,
  max_whatsapp_conversations INTEGER DEFAULT 0,
  
  -- Feature Flags
  features          JSONB NOT NULL DEFAULT '{}',
  -- e.g. { "audit": true, "creative": true, "competitor": false, "whatsapp": false, "api_access": false }
  
  is_active         BOOLEAN DEFAULT TRUE,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Table: subscriptions

```sql
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id               UUID NOT NULL REFERENCES plans(id),
  
  status                VARCHAR(50) NOT NULL,             -- 'trialing', 'active', 'past_due', 'canceled', 'paused'
  billing_cycle         VARCHAR(20) NOT NULL,             -- 'monthly', 'annual'
  
  -- Dates
  trial_ends_at         TIMESTAMP WITH TIME ZONE,
  current_period_start  TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end    TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at           TIMESTAMP WITH TIME ZONE,
  ends_at               TIMESTAMP WITH TIME ZONE,
  
  -- Payment Provider References
  razorpay_subscription_id  VARCHAR(100) UNIQUE,
  stripe_subscription_id    VARCHAR(100) UNIQUE,
  
  -- GST
  gst_number            VARCHAR(20),
  gst_applicable        BOOLEAN DEFAULT TRUE,
  
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

### Table: credits

```sql
CREATE TABLE credits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance       INTEGER NOT NULL DEFAULT 0,               -- current credit balance
  lifetime_used INTEGER NOT NULL DEFAULT 0,               -- total credits ever consumed
  reset_date    TIMESTAMP WITH TIME ZONE,                -- when monthly credits reset
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_credits_user_id ON credits(user_id);
```

---

### Table: credit_transactions

```sql
CREATE TABLE credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,                         -- positive = add, negative = deduct
  type          VARCHAR(50) NOT NULL,
  -- 'monthly_grant', 'topup_purchase', 'campaign_generation', 'audit_run',
  -- 'creative_generation', 'competitor_analysis', 'growth_plan', 'refund'
  description   TEXT,
  reference_id  UUID,                                     -- ID of the operation that consumed credits
  reference_type VARCHAR(50),                             -- 'campaign', 'audit', 'creative', etc.
  balance_after INTEGER NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

---

### Table: campaigns

```sql
CREATE TABLE campaigns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id),
  
  name                  VARCHAR(255) NOT NULL,
  goal                  VARCHAR(100) NOT NULL,
  -- 'leads', 'sales', 'calls', 'bookings', 'brand_awareness', 'website_traffic'
  
  platform              VARCHAR(50) NOT NULL,             -- 'google', 'meta', 'both'
  status                VARCHAR(50) DEFAULT 'draft',
  -- 'draft', 'pending_review', 'approved', 'publishing', 'live', 'paused', 'ended', 'failed'
  
  -- Budget
  daily_budget_paise    INTEGER NOT NULL,
  monthly_budget_paise  INTEGER,
  currency              VARCHAR(10) DEFAULT 'INR',
  
  -- AI Generated Content
  ai_strategy           JSONB,                            -- full strategy rationale
  ai_model_used         VARCHAR(100),
  ai_generation_cost    DECIMAL(10, 6),                   -- USD cost of AI call
  
  -- Google Ads
  google_campaign_id    VARCHAR(100),
  google_published_at   TIMESTAMP WITH TIME ZONE,
  
  -- Meta Ads
  meta_campaign_id      VARCHAR(100),
  meta_published_at     TIMESTAMP WITH TIME ZONE,
  
  -- India Intelligence
  festival_context      VARCHAR(100),                    -- 'diwali', 'ipl', 'wedding_season', etc.
  season_context        VARCHAR(100),
  
  -- Dates
  start_date            DATE,
  end_date              DATE,
  
  -- Performance Summary (denormalized for quick access)
  total_spend_paise     INTEGER DEFAULT 0,
  total_impressions     BIGINT DEFAULT 0,
  total_clicks          BIGINT DEFAULT 0,
  total_conversions     INTEGER DEFAULT 0,
  
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at            TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_campaigns_business_id ON campaigns(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
```

---

### Table: ad_groups

```sql
CREATE TABLE ad_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  theme         VARCHAR(255),                             -- e.g., "Wedding Collection", "Festive Offers"
  platform      VARCHAR(50) NOT NULL,
  status        VARCHAR(50) DEFAULT 'draft',
  bid_strategy  VARCHAR(100),
  bid_amount_paise INTEGER,
  
  -- Google
  google_ad_group_id VARCHAR(100),
  
  -- Meta
  meta_adset_id VARCHAR(100),
  
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_groups_campaign_id ON ad_groups(campaign_id);
```

---

### Table: ads

```sql
CREATE TABLE ads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id     UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  type            VARCHAR(50) NOT NULL,
  -- 'google_responsive_search', 'google_display', 'meta_image', 'meta_video', 'meta_carousel'
  
  status          VARCHAR(50) DEFAULT 'draft',
  
  -- Copy
  headlines       JSONB,                                  -- array of up to 15 headlines (Google RSA)
  descriptions    JSONB,                                  -- array of up to 4 descriptions
  primary_text    TEXT,                                   -- Meta primary text
  cta_text        VARCHAR(100),
  display_url     TEXT,
  final_url       TEXT,
  
  -- Media
  image_urls      JSONB,                                  -- array of image URLs in R2
  video_url       TEXT,
  
  -- Hindi/Hinglish versions
  headlines_hi    JSONB,
  descriptions_hi JSONB,
  primary_text_hi TEXT,
  
  -- Platform IDs
  google_ad_id    VARCHAR(100),
  meta_ad_id      VARCHAR(100),
  
  -- Performance
  impressions     BIGINT DEFAULT 0,
  clicks          BIGINT DEFAULT 0,
  conversions     INTEGER DEFAULT 0,
  spend_paise     INTEGER DEFAULT 0,
  quality_score   SMALLINT,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ads_ad_group_id ON ads(ad_group_id);
CREATE INDEX idx_ads_campaign_id ON ads(campaign_id);
```

---

### Table: keywords

```sql
CREATE TABLE keywords (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id     UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  keyword         VARCHAR(500) NOT NULL,
  keyword_hi      VARCHAR(500),                           -- Hindi version
  match_type      VARCHAR(20) NOT NULL,                   -- 'broad', 'phrase', 'exact'
  bid_paise       INTEGER,
  
  -- Performance
  impressions     BIGINT DEFAULT 0,
  clicks          BIGINT DEFAULT 0,
  conversions     INTEGER DEFAULT 0,
  avg_cpc_paise   INTEGER DEFAULT 0,
  quality_score   SMALLINT,
  
  -- AI metadata
  relevance_score DECIMAL(3, 2),                         -- 0.00 to 1.00
  ai_rationale    TEXT,
  
  is_negative     BOOLEAN DEFAULT FALSE,
  status          VARCHAR(20) DEFAULT 'active',
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_keywords_ad_group_id ON keywords(ad_group_id);
CREATE INDEX idx_keywords_campaign_id ON keywords(campaign_id);
```

---

### Table: audiences

```sql
CREATE TABLE audiences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name            VARCHAR(255) NOT NULL,
  platform        VARCHAR(50) NOT NULL,
  type            VARCHAR(50) NOT NULL,                   -- 'interest', 'custom', 'lookalike', 'retargeting'
  
  -- Meta Targeting
  age_min         SMALLINT,
  age_max         SMALLINT,
  genders         JSONB,                                  -- ['male', 'female', 'all']
  locations       JSONB,                                  -- array of cities/regions
  interests       JSONB,                                  -- array of interest IDs/names
  behaviors       JSONB,
  languages       JSONB,                                  -- ['hindi', 'english']
  
  -- Google Targeting
  in_market_segments  JSONB,
  affinity_segments   JSONB,
  custom_intent       JSONB,
  
  estimated_reach     BIGINT,
  ai_rationale        TEXT,
  
  meta_audience_id    VARCHAR(100),
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audiences_campaign_id ON audiences(campaign_id);
```

---

### Table: audits

```sql
CREATE TABLE audits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),
  
  url               TEXT NOT NULL,
  status            VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'crawling', 'analyzing', 'complete', 'failed'
  
  -- Scores (0-100)
  overall_score     SMALLINT,
  seo_score         SMALLINT,
  ux_score          SMALLINT,
  mobile_score      SMALLINT,
  speed_score       SMALLINT,
  conversion_score  SMALLINT,
  trust_score       SMALLINT,
  ad_readiness_score SMALLINT,
  
  -- Raw Data
  lighthouse_data   JSONB,                               -- raw Lighthouse report
  crawler_data      JSONB,                               -- raw crawler findings
  ai_analysis       JSONB,                               -- AI-interpreted findings
  
  -- Summary
  critical_issues_count  INTEGER DEFAULT 0,
  high_issues_count      INTEGER DEFAULT 0,
  medium_issues_count    INTEGER DEFAULT 0,
  low_issues_count       INTEGER DEFAULT 0,
  
  pdf_url           TEXT,                               -- R2 URL of generated PDF
  
  ai_model_used     VARCHAR(100),
  ai_generation_cost DECIMAL(10, 6),
  credits_used      INTEGER,
  
  completed_at      TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audits_business_id ON audits(business_id);
CREATE INDEX idx_audits_user_id ON audits(user_id);
```

---

### Table: audit_issues

```sql
CREATE TABLE audit_issues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  
  category        VARCHAR(50) NOT NULL,                  -- 'seo', 'ux', 'mobile', 'speed', 'conversion', 'trust'
  severity        VARCHAR(20) NOT NULL,                  -- 'critical', 'high', 'medium', 'low', 'info'
  title           VARCHAR(500) NOT NULL,
  description     TEXT NOT NULL,
  recommendation  TEXT NOT NULL,
  
  impact_score    SMALLINT,                              -- 0-100, how much fixing this helps
  effort_score    SMALLINT,                              -- 0-100, how hard it is to fix
  
  element_selector TEXT,                                 -- CSS selector or URL of the issue
  screenshot_url  TEXT,
  
  is_fixed        BOOLEAN DEFAULT FALSE,
  fixed_at        TIMESTAMP WITH TIME ZONE,
  
  sort_order      INTEGER,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_issues_audit_id ON audit_issues(audit_id);
CREATE INDEX idx_audit_issues_severity ON audit_issues(severity);
```

---

### Table: creatives

```sql
CREATE TABLE creatives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  type            VARCHAR(50) NOT NULL,
  -- 'image_ad', 'reel_concept', 'ugc_script', 'video_script', 'carousel', 'banner', 'display_ad'
  
  title           VARCHAR(255),
  brief           TEXT NOT NULL,                          -- the creative brief
  
  -- Generated Content
  hook_variations     JSONB,                             -- array of hook ideas
  body_copy           TEXT,
  cta_options         JSONB,                             -- array of CTA variations
  visual_direction    TEXT,
  image_prompt        TEXT,                              -- DALL-E / Midjourney prompt
  video_prompt        TEXT,
  storyboard          JSONB,                             -- array of scene descriptions
  
  -- Hindi versions
  brief_hi            TEXT,
  hook_variations_hi  JSONB,
  body_copy_hi        TEXT,
  
  -- Generated Assets
  generated_image_urls JSONB,                           -- R2 URLs
  
  platform            VARCHAR(50),                      -- 'google', 'meta', 'instagram', 'youtube'
  format              VARCHAR(50),                      -- '1080x1080', '1920x1080', '9:16', etc.
  
  ai_model_used       VARCHAR(100),
  ai_generation_cost  DECIMAL(10, 6),
  credits_used        INTEGER,
  
  status              VARCHAR(50) DEFAULT 'draft',
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_creatives_business_id ON creatives(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_creatives_campaign_id ON creatives(campaign_id) WHERE deleted_at IS NULL;
```

---

### Table: competitor_analyses

```sql
CREATE TABLE competitor_analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id),
  
  competitor_name     VARCHAR(255),
  competitor_url      TEXT NOT NULL,
  
  status              VARCHAR(50) DEFAULT 'pending',
  
  -- Analysis Results
  positioning_analysis    JSONB,
  keyword_opportunities   JSONB,                        -- keywords they rank for, we don't
  content_gaps            JSONB,
  market_gaps             JSONB,
  ad_angles               JSONB,
  swot_analysis           JSONB,
  
  -- Meta Ad Library data
  active_meta_ads         JSONB,
  meta_ads_scraped_at     TIMESTAMP WITH TIME ZONE,
  
  -- Top organic keywords
  organic_keywords        JSONB,
  
  -- Ad spend estimate
  estimated_monthly_spend_range  VARCHAR(50),           -- e.g., "₹50K-₹1L"
  
  ai_model_used       VARCHAR(100),
  ai_generation_cost  DECIMAL(10, 6),
  credits_used        INTEGER,
  
  pdf_url             TEXT,
  
  completed_at        TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_competitor_analyses_business_id ON competitor_analyses(business_id);
```

---

### Table: whatsapp_leads

```sql
CREATE TABLE whatsapp_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  phone           VARCHAR(20) NOT NULL,
  name            VARCHAR(255),
  email           VARCHAR(255),
  
  source          VARCHAR(50),                          -- 'campaign', 'organic', 'referral'
  
  -- Lead Intelligence
  intent          VARCHAR(100),                         -- 'buy', 'inquiry', 'booking', 'support'
  lead_score      SMALLINT DEFAULT 0,                   -- 0-100
  qualification_status VARCHAR(50) DEFAULT 'new',
  -- 'new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'
  
  custom_fields   JSONB,                               -- business-specific lead data
  
  last_message_at TIMESTAMP WITH TIME ZONE,
  converted_at    TIMESTAMP WITH TIME ZONE,
  conversion_value_paise INTEGER,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_leads_business_id ON whatsapp_leads(business_id);
CREATE INDEX idx_whatsapp_leads_phone ON whatsapp_leads(business_id, phone);
```

---

### Table: whatsapp_conversations

```sql
CREATE TABLE whatsapp_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID NOT NULL REFERENCES whatsapp_leads(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  status          VARCHAR(50) DEFAULT 'open',           -- 'open', 'closed', 'escalated'
  assigned_to     UUID REFERENCES users(id),            -- human agent if escalated
  
  last_message_at TIMESTAMP WITH TIME ZONE,
  closed_at       TIMESTAMP WITH TIME ZONE,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Table: whatsapp_messages

```sql
CREATE TABLE whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  
  direction       VARCHAR(10) NOT NULL,                 -- 'inbound', 'outbound'
  sender          VARCHAR(20) NOT NULL,                 -- 'lead', 'ai', 'human'
  
  message_type    VARCHAR(20) NOT NULL,                 -- 'text', 'image', 'document', 'button', 'template'
  content         TEXT,
  media_url       TEXT,
  
  -- AI metadata
  ai_intent_detected VARCHAR(100),
  ai_sentiment       VARCHAR(20),
  ai_response_reason TEXT,
  
  is_read         BOOLEAN DEFAULT FALSE,
  
  waba_message_id VARCHAR(200),                        -- WhatsApp message ID for delivery tracking
  status          VARCHAR(50) DEFAULT 'sent',           -- 'sent', 'delivered', 'read', 'failed'
  
  sent_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_conversation_id ON whatsapp_messages(conversation_id);
```

---

### Table: growth_plans

```sql
CREATE TABLE growth_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  
  -- User's Goal Input
  goal_description TEXT NOT NULL,                       -- "I need 50 leads this month"
  goal_type        VARCHAR(50),                         -- 'leads', 'sales', 'calls', 'revenue'
  goal_quantity    INTEGER,
  goal_timeframe   INTEGER,                             -- days
  available_budget_paise INTEGER,
  
  -- AI Output
  recommended_channels JSONB,                          -- which platforms + why
  budget_allocation    JSONB,                          -- how to split budget
  ad_strategy          JSONB,                          -- campaign strategy
  creative_strategy    JSONB,                          -- creative recommendations
  followup_strategy    JSONB,                          -- lead nurture plan
  optimization_plan    JSONB,                          -- week-by-week plan
  
  -- Predictions
  expected_leads       INTEGER,
  expected_cost_paise  INTEGER,
  expected_timeline_days INTEGER,
  confidence_score     DECIMAL(3, 2),                  -- 0.00 to 1.00
  
  -- Outcome Tracking
  actual_leads         INTEGER DEFAULT 0,
  actual_cost_paise    INTEGER DEFAULT 0,
  
  status          VARCHAR(50) DEFAULT 'draft',         -- 'draft', 'active', 'completed', 'abandoned'
  
  ai_model_used   VARCHAR(100),
  ai_generation_cost DECIMAL(10, 6),
  credits_used    INTEGER,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Table: ai_usage_logs

```sql
CREATE TABLE ai_usage_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  
  operation_type    VARCHAR(100) NOT NULL,
  -- 'campaign_generate', 'audit_analyze', 'creative_generate', etc.
  
  provider          VARCHAR(50) NOT NULL,               -- 'openai', 'anthropic', 'google', 'openrouter'
  model             VARCHAR(100) NOT NULL,
  
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  total_tokens      INTEGER,
  
  cost_usd          DECIMAL(10, 8),
  
  latency_ms        INTEGER,
  success           BOOLEAN DEFAULT TRUE,
  error_message     TEXT,
  
  reference_id      UUID,                              -- ID of the object created
  reference_type    VARCHAR(50),
  
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX idx_ai_usage_logs_operation_type ON ai_usage_logs(operation_type);
```

---

### Table: teams

```sql
CREATE TABLE teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES users(id),
  name            VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Table: team_members

```sql
CREATE TABLE team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  
  email           VARCHAR(255) NOT NULL,                -- for pending invitations
  role            VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  status          VARCHAR(20) DEFAULT 'pending',        -- 'pending', 'active', 'removed'
  
  invited_by      UUID REFERENCES users(id),
  accepted_at     TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(team_id, email)
);
```

---

### Table: india_intelligence

```sql
CREATE TABLE india_intelligence (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type        VARCHAR(50) NOT NULL,
  -- 'festival', 'sporting_event', 'exam_season', 'wedding_season', 'monsoon', 'harvest'
  
  name              VARCHAR(100) NOT NULL,              -- 'Diwali', 'IPL', 'Board Exams'
  name_hi           VARCHAR(100),
  
  -- Timing
  typical_start_month  SMALLINT,                       -- 1-12
  typical_end_month    SMALLINT,
  peak_week            SMALLINT,                       -- week of year (1-52)
  advance_prep_days    INTEGER DEFAULT 30,             -- how many days before to start campaigns
  
  -- Relevance by Industry
  relevant_industries JSONB,
  -- { "retail": 0.95, "restaurant": 0.70, "clinic": 0.20, "education": 0.80 }
  
  -- City Tier Relevance
  tier1_relevance   DECIMAL(3, 2),
  tier2_relevance   DECIMAL(3, 2),
  tier3_relevance   DECIMAL(3, 2),
  
  -- Budget Multipliers (how much to increase budget during this period)
  budget_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  
  -- Strategic Guidance
  strategy_notes    TEXT,
  keywords_boost    JSONB,                            -- keywords to add during this period
  creative_themes   JSONB,                            -- visual/copy themes that work
  
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Table: payments

```sql
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  subscription_id       UUID REFERENCES subscriptions(id),
  
  amount_paise          INTEGER NOT NULL,
  currency              VARCHAR(10) DEFAULT 'INR',
  gst_amount_paise      INTEGER DEFAULT 0,
  
  status                VARCHAR(50) NOT NULL,
  -- 'pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded'
  
  payment_method        VARCHAR(50),                  -- 'upi', 'card', 'netbanking', 'wallet'
  
  -- Razorpay
  razorpay_order_id     VARCHAR(100),
  razorpay_payment_id   VARCHAR(100) UNIQUE,
  razorpay_signature    TEXT,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(100) UNIQUE,
  stripe_invoice_id        VARCHAR(100),
  
  description           TEXT,
  invoice_url           TEXT,                        -- R2 URL of generated invoice PDF
  
  failure_reason        TEXT,
  refunded_amount_paise INTEGER DEFAULT 0,
  
  paid_at               TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

### Table: notifications

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type            VARCHAR(100) NOT NULL,
  -- 'campaign_ready', 'audit_complete', 'campaign_live', 'lead_received',
  -- 'credit_low', 'payment_failed', 'team_invite'
  
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  action_url      TEXT,
  
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMP WITH TIME ZONE,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
```

---

## 6. Folder Structure

```
adpilot-india/
│
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── forgot-password/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   ├── campaigns/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   └── new/
│   │   │   │   ├── audit/
│   │   │   │   ├── creatives/
│   │   │   │   ├── competitors/
│   │   │   │   ├── whatsapp/
│   │   │   │   ├── growth/
│   │   │   │   ├── settings/
│   │   │   │   └── billing/
│   │   │   ├── (admin)/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── revenue/
│   │   │   │   │   ├── ai-usage/
│   │   │   │   │   └── system/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx           # Landing page
│   │   │   │   └── pricing/
│   │   │   └── api/                   # BFF routes only
│   │   │       ├── auth/
│   │   │       └── webhooks/
│   │   ├── components/
│   │   │   ├── ui/                    # Shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── campaign/
│   │   │   │   ├── CampaignWizard.tsx
│   │   │   │   ├── CampaignCard.tsx
│   │   │   │   ├── AdPreview.tsx
│   │   │   │   └── CampaignApprovalGate.tsx
│   │   │   ├── audit/
│   │   │   │   ├── AuditScoreCard.tsx
│   │   │   │   ├── IssueList.tsx
│   │   │   │   └── AuditPDFButton.tsx
│   │   │   ├── creative/
│   │   │   ├── competitor/
│   │   │   ├── whatsapp/
│   │   │   ├── growth/
│   │   │   ├── onboarding/
│   │   │   │   └── ConversationalWizard.tsx
│   │   │   ├── billing/
│   │   │   └── shared/
│   │   │       ├── LanguageToggle.tsx
│   │   │       ├── CreditMeter.tsx
│   │   │       ├── JobProgress.tsx    # polls job status, shows progress bar
│   │   │       └── OutcomeFraming.tsx # always shows "leads/sales" not "campaigns"
│   │   ├── lib/
│   │   │   ├── api-client.ts          # typed fetch wrapper
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useJob.ts              # polls job status
│   │   │   ├── useCredits.ts
│   │   │   └── useBusiness.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   └── onboarding.store.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── api/                           # Express backend
│       ├── src/
│       │   ├── server.ts              # Express app entry
│       │   ├── config/
│       │   │   ├── index.ts           # env validation with Zod
│       │   │   ├── database.ts        # Prisma client
│       │   │   └── redis.ts           # Redis client
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rbac.middleware.ts
│       │   │   ├── rateLimit.middleware.ts
│       │   │   ├── validate.middleware.ts
│       │   │   └── errorHandler.middleware.ts
│       │   ├── routes/
│       │   │   ├── v1/
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── businesses.routes.ts
│       │   │   │   ├── campaigns.routes.ts
│       │   │   │   ├── audits.routes.ts
│       │   │   │   ├── creatives.routes.ts
│       │   │   │   ├── competitors.routes.ts
│       │   │   │   ├── whatsapp.routes.ts
│       │   │   │   ├── growth.routes.ts
│       │   │   │   ├── billing.routes.ts
│       │   │   │   ├── teams.routes.ts
│       │   │   │   └── notifications.routes.ts
│       │   │   └── admin/
│       │   │       ├── users.routes.ts
│       │   │       ├── revenue.routes.ts
│       │   │       └── system.routes.ts
│       │   ├── services/
│       │   │   ├── ai/
│       │   │   │   ├── AIRouter.ts             # core routing logic
│       │   │   │   ├── PromptRegistry.ts        # all prompts, versioned
│       │   │   │   ├── ModelSelector.ts
│       │   │   │   ├── CostMeter.ts
│       │   │   │   ├── ResponseValidator.ts
│       │   │   │   ├── adapters/
│       │   │   │   │   ├── OpenAIAdapter.ts
│       │   │   │   │   ├── AnthropicAdapter.ts
│       │   │   │   │   ├── GeminiAdapter.ts
│       │   │   │   │   └── OpenRouterAdapter.ts
│       │   │   │   └── prompts/
│       │   │   │       ├── campaign.prompts.ts
│       │   │   │       ├── audit.prompts.ts
│       │   │   │       ├── creative.prompts.ts
│       │   │   │       ├── competitor.prompts.ts
│       │   │   │       └── growth.prompts.ts
│       │   │   ├── campaign/
│       │   │   │   ├── CampaignGeneratorService.ts
│       │   │   │   ├── CampaignPublisherService.ts  # Phase 2 (Google/Meta API)
│       │   │   │   └── KeywordResearchService.ts
│       │   │   ├── audit/
│       │   │   │   ├── AuditOrchestratorService.ts
│       │   │   │   ├── LighthouseService.ts         # Phase 2
│       │   │   │   └── PDFGeneratorService.ts
│       │   │   ├── creative/
│       │   │   │   └── CreativeGeneratorService.ts
│       │   │   ├── competitor/
│       │   │   │   ├── CompetitorAnalysisService.ts
│       │   │   │   └── MetaAdLibraryService.ts
│       │   │   ├── whatsapp/
│       │   │   │   ├── WhatsAppService.ts
│       │   │   │   └── LeadQualificationService.ts
│       │   │   ├── growth/
│       │   │   │   └── GrowthPlanService.ts
│       │   │   ├── billing/
│       │   │   │   ├── RazorpayService.ts
│       │   │   │   ├── StripeService.ts
│       │   │   │   └── InvoiceService.ts
│       │   │   ├── india/
│       │   │   │   └── IndiaIntelligenceService.ts  # seasonal/festival queries
│       │   │   ├── CreditService.ts
│       │   │   ├── AuthService.ts
│       │   │   ├── NotificationService.ts
│       │   │   └── StorageService.ts               # Cloudflare R2
│       │   ├── jobs/
│       │   │   ├── queue.ts                        # BullMQ queue definitions
│       │   │   ├── workers/
│       │   │   │   ├── campaign.worker.ts
│       │   │   │   ├── audit.worker.ts
│       │   │   │   ├── creative.worker.ts
│       │   │   │   ├── competitor.worker.ts
│       │   │   │   ├── growth.worker.ts
│       │   │   │   ├── pdf.worker.ts
│       │   │   │   └── whatsapp.worker.ts
│       │   │   └── schedulers/
│       │   │       ├── creditReset.scheduler.ts    # monthly credit grants
│       │   │       └── festivalAlert.scheduler.ts  # upcoming festival warnings
│       │   ├── validators/
│       │   │   ├── campaign.schema.ts
│       │   │   ├── audit.schema.ts
│       │   │   ├── auth.schema.ts
│       │   │   └── billing.schema.ts
│       │   ├── lib/
│       │   │   ├── logger.ts
│       │   │   ├── errors.ts          # AppError class hierarchy
│       │   │   └── helpers.ts
│       │   └── types/
│       │       └── index.ts
│       └── prisma/
│           ├── schema.prisma
│           ├── seed.ts
│           └── migrations/
│
├── packages/
│   └── shared/                        # shared types between web and api
│       ├── types/
│       │   ├── campaign.types.ts
│       │   ├── user.types.ts
│       │   └── api.types.ts           # API request/response shapes
│       └── constants/
│           ├── credits.ts             # credit costs per operation
│           ├── plans.ts               # plan feature flags
│           └── india.ts               # festival dates, city tiers
│
├── .env.example
├── package.json                       # turborepo workspace root
├── turbo.json
├── docker-compose.yml                 # local dev: postgres + redis
└── README.md
```

---

## 7. MVP Roadmap

### MVP Definition Principle

An MVP is not a smaller version of everything. It is the smallest version that delivers the core promise: "Type your business in plain Hindi and get a professional ad campaign ready to run." Everything else is Post-MVP.

---

### Phase 1 — Foundation & Core Loop (Weeks 1–8)

**Goal:** A user can sign up, describe their business, and receive an AI-generated campaign they can review and approve.

**Week 1–2: Infrastructure & Auth**
- [ ] Monorepo setup (turborepo, Next.js, Express, TypeScript)
- [ ] PostgreSQL via Supabase + Prisma schema + first migration
- [ ] Redis setup (local Docker dev + Railway prod)
- [ ] Environment config with Zod validation
- [ ] JWT auth: email/password login + signup
- [ ] Google OAuth
- [ ] OTP login via Resend (email) + MSG91 (SMS)
- [ ] Refresh token rotation
- [ ] Auth middleware + RBAC middleware
- [ ] Basic error handling + Winston logging
- [ ] Sentry integration

**Week 3–4: Business Onboarding + AI Router**
- [ ] Business creation flow (conversational wizard UI)
- [ ] India Intelligence database seeded (festivals, city tiers, seasonal profiles)
- [ ] AI Router service with OpenAI + Anthropic adapters
- [ ] Prompt Registry with campaign generation prompts (EN + HI)
- [ ] Credit system: tables, CreditService, deduction middleware
- [ ] BullMQ queue setup with campaign worker
- [ ] Job status polling API + frontend JobProgress component

**Week 5–6: Campaign Builder (Module 1 — Draft Mode)**
- [ ] Campaign wizard UI (business type → goal → budget → location → generate)
- [ ] AI campaign generation (keywords, ad groups, headlines, descriptions, audiences)
- [ ] Hindi/Hinglish input handling
- [ ] India Intelligence enrichment (festival context injection)
- [ ] Campaign review/approval UI (CampaignApprovalGate)
- [ ] Campaign storage + versioning
- [ ] Campaign list/detail pages
- [ ] Policy pre-check layer (AI validates copy before showing user)
- [ ] Basic campaign performance placeholder (ready for Phase 2 data)

**Week 7–8: Billing + Dashboard**
- [ ] Razorpay integration (subscriptions + one-time payments)
- [ ] GST invoicing
- [ ] Plan management UI (upgrade/downgrade)
- [ ] Credit top-up flow
- [ ] Main dashboard (campaigns count, credit balance, recent activity)
- [ ] Notification system
- [ ] Basic settings page (profile, business, billing)
- [ ] Email onboarding sequence via Resend
- [ ] PostHog analytics integration
- [ ] Deployment: Vercel (frontend) + Railway (backend) + Supabase (DB)

**Phase 1 Exit Criteria:**
- User can sign up in under 2 minutes
- User can generate a campaign in under 5 minutes
- Campaign output is professional quality reviewable by user
- Payment works with INR + GST invoice
- System handles 50 concurrent users without degradation

---

### Phase 2 — Expansion Modules (Weeks 9–16)

**Goal:** Add audit, creatives, and real ad publishing. Land first 100 paying customers.

**Week 9–10: Marketing Audit (Module 2)**
- [ ] URL submission + Lighthouse CI integration
- [ ] AI analysis on top of Lighthouse data
- [ ] Audit scoring (SEO, UX, Mobile, Speed, Conversion, Trust)
- [ ] Issue list with priority + recommendation
- [ ] PDF report generation + R2 storage
- [ ] Audit history per business

**Week 11–12: Creative Generator (Module 3)**
- [ ] Creative brief wizard (platform → format → goal → generate)
- [ ] Hook variations, body copy, CTA options
- [ ] Storyboard / scene descriptions
- [ ] DALL-E image prompt generation
- [ ] Hindi/Hinglish creative variants
- [ ] Creative library per business
- [ ] Download creative brief as PDF

**Week 13–14: Google Ads + Meta Ads Publishing**
- [ ] Google Ads API OAuth flow (connect ad account)
- [ ] Campaign publish to Google (Draft → Live with one click)
- [ ] Meta Marketing API OAuth flow
- [ ] Campaign publish to Meta
- [ ] Real-time performance data sync (daily pull from APIs)
- [ ] Performance dashboard with Recharts

**Week 15–16: Agency Mode + Team Features**
- [ ] Multi-client workspace for agencies
- [ ] Team invitations + role management
- [ ] Client reporting view
- [ ] Stripe integration for international payments
- [ ] Admin panel (users, revenue, AI usage, system health)

**Phase 2 Exit Criteria:**
- 100 paying customers
- Campaigns publishing to Google/Meta successfully
- Agency plan actively used by at least 3 agencies

---

### Phase 3 — Competitive Differentiation (Weeks 17–24)

**Goal:** Build the moat. Add WhatsApp agent, competitor intelligence, AI Growth Manager.

**Week 17–18: Competitor Intelligence (Module 4)**
- [ ] Competitor URL input + Meta Ad Library API scraping
- [ ] SWOT analysis generation
- [ ] Keyword gap analysis
- [ ] Ad angle opportunities
- [ ] Competitive positioning recommendations
- [ ] PDF export

**Week 19–21: WhatsApp AI Agent (Module 5)**
- [ ] WABA setup + Gupshup integration
- [ ] Lead qualification conversation flow
- [ ] Appointment booking integration
- [ ] FAQ handling
- [ ] Lead scoring
- [ ] Human handoff escalation
- [ ] Conversation analytics dashboard
- [ ] Campaign → WhatsApp lead flow connection

**Week 22–24: AI Growth Manager (Module 6 — Signature Feature)**
- [ ] Goal input wizard ("I need 50 leads in 30 days")
- [ ] Multi-channel strategy generation
- [ ] Budget allocation optimizer
- [ ] Growth plan with expected outcomes
- [ ] Week-by-week optimization calendar
- [ ] Outcome vs prediction tracking
- [ ] India Intelligence-aware seasonal adjustments
- [ ] Growth plan PDF export

---

### Phase 4 — Scale & Enterprise (Month 7+)

- White-label solution for large agencies
- Enterprise SSO (SAML)
- API access for enterprise integrations
- YouTube Ads support
- Regional language expansion (Tamil, Telugu, Marathi)
- AI-automated campaign optimization (bid adjustments, budget reallocation)
- Predictive analytics (churn prediction, budget forecasting)
- Franchise management dashboard

---

## 8. What to Build First

### The Order of Operations

**Build in this exact sequence. Do not parallelize until Week 5.**

**Step 1 — Infrastructure (cannot skip)**  
Without working auth, a database, and a queue system, nothing else can exist. Start here. One developer can own this entirely. By end of Week 2, any feature developer can start working.

**Step 2 — AI Router (the nervous system)**  
Every module depends on the AI Router. Build it as a proper service with adapters, prompt registry, and cost metering before writing a single product prompt. A well-built router saves weeks of debugging later. This is the single most important architectural investment in the codebase.

**Step 3 — Campaign Builder in draft mode (the proof of concept)**  
This proves the core value proposition. If a saree shop owner in Bhopal types "Meri saree shop hai" and gets a professional campaign back in 90 seconds, the product works. Everything else is enhancement. Build this before anything else.

**Step 4 — Billing (gates revenue)**  
Without billing, you cannot charge. Build billing in Phase 1, not Phase 2. Many startups defer billing and then scramble to retrofit it. Credit system goes here too.

**Step 5 — India Intelligence Layer (the moat starts here)**  
Seed the festival, city tier, and seasonal data before the campaign builder goes live. This is what makes the first campaign output different from a generic AI — the system knows Diwali is coming, that the user is in a Tier 2 city, that wedding season means 3x the saree demand. The data is simple to add but the impact is disproportionate.

### What NOT to Build First

- **Do NOT build the WhatsApp agent first.** WABA approval takes 8+ weeks. Start this in parallel during Phase 1 as a background admin task.
- **Do NOT build the competitor intelligence module first.** It is compelling to demo but not part of the core loop.
- **Do NOT build the Growth Manager first.** It is the "most important module" but it depends on all others having data. It must be last.
- **Do NOT wire up Google/Meta API publishing in Phase 1.** The API approval takes time and draft mode is a feature, not a compromise — it builds trust through user review.

### The Single Most Important Design Decision

**Every AI operation must be asynchronous with observable job status.**

Do not build a synchronous "wait for AI response" pattern. Indian mobile connections are inconsistent. LLM calls take 10–60 seconds. A synchronous pattern will produce timeouts, retries, and duplicate charges.

Build the queue + worker + job status poll pattern from Day 1. It is slightly more complex to build but it makes everything else — retries, cost control, progress indication, failure recovery — trivially easy.

---

## Appendix A: Credit Cost Matrix

| Operation | Credits | Rationale |
|-----------|---------|-----------|
| Campaign generation (full) | 15 | High token count, complex output |
| Campaign regenerate section | 5 | Partial rewrite |
| Marketing audit (AI only) | 10 | Analysis without crawler |
| Marketing audit (full + Lighthouse) | 25 | Crawler + AI + PDF |
| Creative brief | 8 | Medium complexity |
| Competitor analysis | 20 | Multi-step research + analysis |
| Growth plan generation | 20 | Complex multi-channel planning |
| WhatsApp AI response | 1 | Per message, high volume |
| PDF report generation | 2 | Post-processing |

---

## Appendix B: Environment Variables Required

```
# Database
DATABASE_URL=

# Redis
REDIS_URL=

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
OPENROUTER_API_KEY=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Messaging
RESEND_API_KEY=
MSG91_API_KEY=
MSG91_SENDER_ID=

# Storage
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Ad Platforms (Phase 2)
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
META_APP_ID=
META_APP_SECRET=

# WhatsApp (Phase 3)
GUPSHUP_API_KEY=
WABA_PHONE_NUMBER_ID=
WABA_ACCESS_TOKEN=

# Monitoring
SENTRY_DSN=
POSTHOG_API_KEY=
```

---

## Appendix C: API Response Envelope

All API responses follow this structure:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "credits_used": 15,
    "credits_remaining": 185
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "CAMPAIGN_GENERATION_FAILED",
    "message": "Human-readable message",
    "details": { ... }   // only in development
  }
}

// Async job started
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "queued",
    "poll_url": "/api/v1/jobs/uuid/status",
    "estimated_seconds": 45
  }
}
```

---

*This BUILD_PLAN.md is the authoritative source of architectural truth for AdPilot India. All implementation decisions should be validated against this document. Update it when architectural decisions change — do not let it drift from reality.*
