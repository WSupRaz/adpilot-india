# AdPilot India — Database Schema Reference

## Overview

- **Database**: PostgreSQL 15 (hosted on Supabase)
- **ORM**: Prisma
- **Schema file**: `database/schema.prisma`
- **All monetary values**: stored in **paise** (₹1 = 100 paise) to avoid floating-point issues
- **All IDs**: UUID v4

---

## Table Map

| Table | Description |
|-------|-------------|
| `users` | User accounts (email + Google OAuth) |
| `businesses` | Business profiles owned by users |
| `plans` | Subscription plan definitions |
| `subscriptions` | Active user subscriptions |
| `credits` | Credit balance per user (1:1) |
| `credit_transactions` | Audit log of every credit change |
| `campaigns` | Ad campaigns (Google/Meta) |
| `ad_groups` | Ad groups within a campaign |
| `ads` | Individual ads within an ad group |
| `keywords` | Keywords assigned to ad groups |
| `audits` | Website audit jobs + scores |
| `audit_issues` | Individual issues found per audit |
| `creatives` | AI-generated creative briefs/scripts |
| `competitor_analyses` | Competitor intelligence reports |
| `whatsapp_leads` | Leads captured via WhatsApp |
| `whatsapp_conversations` | WhatsApp conversation threads |
| `whatsapp_messages` | Individual messages in a conversation |
| `growth_plans` | AI-generated 30/60/90-day growth plans |
| `ai_usage_logs` | Every AI call: model, tokens, cost, latency |
| `teams` | Team objects for multi-user access |
| `team_members` | Team membership with roles |
| `india_intelligence` | Festival/season data with budget multipliers |
| `payments` | Payment records (Razorpay + Stripe) |
| `notifications` | In-app notifications per user |

---

## Key Design Decisions

### Money in Paise
All `*Paise` columns store integers. Never use `Float` for money.
```
₹999 → 99900 paise
₹2,999 → 299900 paise
```

### Soft Deletes
`users`, `businesses`, `campaigns`, `creatives` have a `deletedAt` column.
Prisma middleware should filter `deletedAt: null` on all queries by default.

### Credits as a Transaction Log
`credits.balance` is the current balance.
`credit_transactions` is the immutable audit log.
Both are updated atomically via Prisma transactions in `CreditService.checkAndDeduct()`.

### Campaign Status Flow
```
draft → pending_review → approved → publishing → live
                      ↘ rejected
live → paused → live (can toggle)
live/paused → ended (date-based)
any → failed (on platform API error)
```

### JSON Columns
Several columns use `Json` type for flexible AI output:
- `campaigns.aiStrategy` — full AI-generated campaign strategy
- `audits.aiAnalysis` — structured AI analysis
- `competitor_analyses.*` — all AI output sections
- `india_intelligence.relevantIndustries` — array of industry strings
- `india_intelligence.keywordsBoost` — array of keyword strings

---

## Indexes

Critical indexes for query performance:

| Table | Column(s) | Reason |
|-------|-----------|--------|
| `users` | `email` | Login lookup |
| `businesses` | `ownerId` | List businesses by user |
| `campaigns` | `businessId`, `userId`, `status` | Filtered campaign lists |
| `credit_transactions` | `userId`, `createdAt` | Transaction history pagination |
| `ai_usage_logs` | `userId`, `createdAt`, `operationType` | Cost reporting |
| `notifications` | `userId, isRead` | Unread notification count |

---

## Seeding

Run seed:
```bash
cd database
npx ts-node seed.ts
```

Seed creates:
1. **Plans**: starter, growth, agency, enterprise
2. **India Intelligence**: 11 festivals/seasons with budget multipliers
3. **Superadmin user**: credentials from env `ADMIN_EMAIL` + `ADMIN_PASSWORD`

---

## Migrations

```bash
# Generate migration after schema change
npx prisma migrate dev --name describe_change

# Apply migrations in production
npx prisma migrate deploy

# Reset (dev only — destroys all data)
npx prisma migrate reset
```

---

## Common Queries

### Get user with credit balance
```typescript
prisma.user.findUnique({
  where: { id: userId },
  include: { credits: true }
})
```

### Get campaigns for a business with pagination
```typescript
prisma.campaign.findMany({
  where: { businessId, deletedAt: null },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * pageSize,
  take: pageSize,
})
```

### Deduct credits (atomic transaction)
```typescript
await prisma.$transaction([
  prisma.credits.update({
    where: { userId },
    data: { balance: { decrement: cost }, lifetimeUsed: { increment: cost } }
  }),
  prisma.creditTransaction.create({
    data: { userId, amount: -cost, type: operation, balanceAfter: newBalance }
  })
])
```
