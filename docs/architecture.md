# AdPilot India — System Architecture

## Overview

AdPilot India is a multi-tenant SaaS platform that acts as an "AI Marketing Employee" for Indian SMBs. The system generates, analyzes, and (optionally) publishes digital advertising campaigns on Google and Meta, with deep India market context.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Next.js 14 (App Router)  ·  TypeScript  ·  Tailwind CSS   │
│  Zustand  ·  TanStack Query  ·  NextAuth.js                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (proxied via Next.js rewrites)
┌────────────────────────▼────────────────────────────────────┐
│                       API LAYER                              │
│  Node.js + Express + TypeScript                              │
│  JWT Auth  ·  RBAC Middleware  ·  Zod Validation            │
│  Rate Limiting (Redis-backed)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
┌─────────▼──────┐ ┌─────▼──────┐ ┌───▼───────────┐
│  PostgreSQL 15  │ │   Redis 7  │ │  Cloudflare R2 │
│  (Supabase)    │ │  Cache +   │ │  (Media/PDFs)  │
│  Prisma ORM    │ │  BullMQ    │ │                │
└────────────────┘ └─────┬──────┘ └───────────────┘
                         │
              ┌──────────▼──────────┐
              │   BullMQ Workers    │
              │  campaign.worker    │
              │  audit.worker       │
              │  notification.worker│
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     AI ROUTER       │
              │  Fallback Chain:    │
              │  Anthropic → OpenAI │
              │  → Gemini → OpenRouter│
              └─────────────────────┘
```

---

## Monorepo Structure

```
AdPilot-India/
├── frontend/        Next.js 14 app
├── backend/         Express API server
├── shared/          Shared TypeScript constants/types
├── database/        Prisma schema + migrations + seed
└── docs/            Architecture, API, DB, Deployment docs
```

npm workspaces at root; `shared` package is referenced by both frontend and backend.

---

## Authentication Flow

1. User registers or signs in via Google OAuth (NextAuth.js) or Email/Password
2. NextAuth issues a session JWT containing `userId` and `role`
3. Frontend Next.js API routes (`/api/auth/*`) handle NextAuth callbacks
4. For backend calls, `apiClient` (frontend) includes the session token in `Authorization: Bearer` header
5. `authMiddleware` (backend) verifies JWT, attaches `userId` + `role` to `req`
6. `requireRole(minimumRole)` RBAC middleware enforces access

---

## Async Job Architecture

All AI operations are asynchronous. Synchronous HTTP is only used for CRUD.

```
POST /api/v1/campaigns          → validates → deducts credits → enqueues BullMQ job
                                                              → returns { jobId }

GET /api/v1/jobs/:jobId/status  → returns { status, progress, resultId? }

BullMQ Worker:
  1. Policy check (AI)
  2. Campaign generation (AI)
  3. Save to DB
  4. Send notification
  5. Update job status → 'complete' with resultId

Frontend:
  useJob(jobId) hook polls /jobs/:id/status every 2s
  JobProgress component shows progress bar → calls onComplete(resultId)
```

**Why async:** LLM calls take 10-60s. Indian mobile connections are unreliable. Users should not wait on a spinner for an HTTP response.

---

## Credit Economy

Credits are consumed per AI operation. Deduction happens **before** job enqueue via `CreditService.checkAndDeduct()` in a Prisma transaction.

On worker failure: credits are refunded. This prevents charging users for failed AI calls.

```
CREDIT_COSTS (from shared package):
  campaign_generate:       15
  audit_analyze:           10
  audit_full_lighthouse:   25
  creative_generate:        8
  competitor_analyze:      20
  growth_plan:             20
  whatsapp_ai_response:     1
  pdf_report_generate:      2
```

---

## AI Routing

The `AIRouter` iterates through a model fallback chain per operation:

```
TaskType × Language → { provider, model, fallbackChain }

Example: campaign_generate × Hindi
  1. Gemini 1.5 Pro  (best Hindi)
  2. Claude Sonnet 4.6
  3. GPT-4o (fallback)
  4. OpenRouter (last resort)
```

All AI calls are logged to `ai_usage_logs` with token count, latency, cost in USD.

---

## India Intelligence Layer

A structured `india_intelligence` DB table (not just prompts) stores:
- Festival names (English + Hindi)
- Typical months, peak week, advance prep days
- Budget multipliers per festival
- Relevant industries
- Tier 1/2/3 city relevance scores
- Keyword boost arrays
- Creative themes

`IndiaIntelligenceService.getUpcomingEvents(businessType, cityTier)` queries this table and injects context into every AI prompt.

---

## Human-in-the-Loop (Campaign Approval)

Phase 1: Draft mode only — no real ad publishing.
Phase 2+: `CampaignApprovalGate` component blocks publishing until explicit user approval.

```
Campaign status flow:
draft → pending_review → approved → publishing → live
                      ↘ rejected (back to draft)
```

This is a hard requirement. No campaign publishes without explicit user action.

---

## Multi-tenancy

- Each user has a `Credits` record (1:1)
- Each user owns 0-N `Business` records (limited by plan)
- All queries are scoped by `userId` or `businessId` at the service layer
- Team sharing uses `TeamMember` join table with roles

---

## Payments

- **India**: Razorpay subscription API — supports UPI, cards, netbanking; GST-aware
- **International**: Stripe subscriptions
- All amounts stored in paise (₹1 = 100p) to avoid float precision issues
- Webhooks: `/api/webhooks/razorpay`, `/api/webhooks/stripe` — HMAC verified before processing

---

## Monitoring

- **Sentry**: Error tracking (both frontend and backend)
- **PostHog**: Product analytics, feature flags, session replay
- **Winston**: Structured JSON logs (backend)
- **BullMQ Dashboard**: Job queue monitoring (admin only)
