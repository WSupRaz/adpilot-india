# AdPilot India — AI Marketing SaaS for Indian SMBs

**Your AI Marketing Employee.** AdPilot generates complete, ready-to-publish Google & Meta ad campaigns from a plain-language business description — in Hindi, Hinglish, or English — using GPT-4o.

🚀 **Live:** https://adpilot-india.vercel.app
💻 **Frontend + Backend:** this repo
🔗 **Author:** [Himanshu Patel](https://www.linkedin.com/in/himanshu-patel-5195501a2/)

---

## The Problem

India has ~63 million small and medium businesses. Most can't afford a marketing agency (₹15,000–₹50,000/month). So they either run bad ad campaigns themselves or run none at all.

AdPilot delivers the core of what an agency does — campaign strategy, copy, targeting, budget allocation — for ₹499/month, in the language the business owner actually speaks.

---

## What It Does

A business owner describes their business in plain language (Hindi / Hinglish / English). AdPilot's AI generates a complete campaign: headlines, ad copy, keywords, targeting, budget split, and bid strategy — bilingual output, ready to publish.

Core features:

- **AI Campaign Generator** — GPT-4o turns a plain-language description into a full Google/Meta campaign, output in Hindi + English.
- **India Intelligence Engine** — detects upcoming festivals (Diwali, Holi, IPL, wedding season), applies budget multipliers, and adjusts strategy by city tier (Tier 1/2/3).
- **Async AI Pipeline** — AI generation runs in the background via BullMQ + Redis; the app never freezes and one slow job never blocks another user.
- **Credit System** — atomic credit deduction before each job, automatic refund if generation fails, full transaction history.
- **Campaign Wizard** — a 5-step guided flow from business selection to review-and-generate.
- **Multi-Business Support** — one user manages multiple businesses, each with its own campaigns and profile.
- **Dashboard & Analytics** — live impressions, clicks, conversions, and spend across campaigns.
- **Auth & Roles** — JWT (access + refresh) wrapped by NextAuth, with user/admin/superadmin roles.

---

## Architecture

```
User Browser
    │
    ▼
Next.js 14 Frontend (Vercel)  ──►  polls job status: queued → active → completed
    │
    ▼
Express + TypeScript API (Railway)
    │
    ├──►  BullMQ Job Queues (Redis / Upstash)  ──►  Background Worker  ──►  OpenAI GPT-4o
    │                                                      │
    ▼                                                      ▼
PostgreSQL (Supabase, Prisma ORM, 20+ tables)  ◄──────────┘
```

**Why async:** AI generation is slow and can fail. Instead of blocking the server on a 30-second OpenAI call, the API queues the job and returns instantly. A separate worker processes it, so the app stays responsive and resilient under load.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query, Zustand, Framer Motion |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| AI | OpenAI GPT-4o (multi-provider architecture ready for Claude & Gemini) |
| Async | BullMQ, Redis (Upstash) — 8 dedicated queues |
| Database | PostgreSQL (Supabase), 20+ tables |
| Auth | JWT (access + refresh) + NextAuth.js, role-based access |
| Deployment | Vercel (frontend), Railway (backend + workers), GitHub CI/CD |
| Ops | Sentry (errors), Winston (logging), Helmet + rate limiting |

---

## Engineering Highlights

- **Monorepo** — frontend, backend, and a shared package with TypeScript types used by both sides, so the two can't silently drift.
- **8 isolated job queues** — campaign generation, audit, creative generation, competitor analysis, growth planning, reports, WhatsApp, email — so one slow job type never starves another.
- **Non-blocking worker startup** — the server boots even if Redis is temporarily unavailable.
- **Money as integers** — all amounts stored in paise (₹1 = 100 paise) to eliminate floating-point rounding errors.
- **Soft deletes** — `deletedAt` on all major models; nothing is ever truly lost.
- **Atomic credit metering** — deduction and refund wrapped so concurrent requests can't double-spend.

---

## Running Locally

```bash
git clone https://github.com/WSupRaz/adpilot-india
cd adpilot-india

# install
npm install

# environment
cp .env.example .env
# fill in your values (see .env.example)

# database
npx prisma migrate dev

# run (see package.json scripts for frontend/backend/worker)
npm run dev
```

See `.env.example` for required variables (database URL, OpenAI key, Redis URL, JWT secrets).

---

## Status

Live in production. Built and deployed solo, end-to-end — schema design, backend, frontend, async pipeline, and multi-cloud deployment.

**Roadmap:** Razorpay billing integration (architected, pending keys), Google OAuth (pending credentials), multi-provider LLM switching (Claude/Gemini), and expanded creative generation.

---

## Author

**Himanshu Patel** — AI Engineer, Bangalore.
[LinkedIn](https://www.linkedin.com/in/himanshu-patel-5195501a2/) · [GitHub](https://github.com/WSupRaz) · [Portfolio](https://himanshu-portfolio-khaki.vercel.app/)

Open to AI Engineer / Generative AI Engineer / AI Product Engineer roles.
