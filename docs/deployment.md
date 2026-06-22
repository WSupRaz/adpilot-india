# AdPilot India — Deployment Guide

## Infrastructure Overview

| Service | Provider | Notes |
|---------|----------|-------|
| Frontend | Vercel | Next.js deployment, edge network |
| Backend API | Railway or Render | Node.js + Express |
| Database | Supabase | PostgreSQL 15, connection pooling via PgBouncer |
| Redis | Upstash | Serverless Redis for BullMQ + rate limiting |
| Media Storage | Cloudflare R2 | PDFs, ad creatives, logos |
| Email | Resend | Transactional email |
| SMS / OTP | MSG91 | Indian mobile OTP |
| Error Tracking | Sentry | Frontend + backend |
| Analytics | PostHog | Product analytics |

---

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15 (Supabase project)
- Redis (Upstash or local)
- All API keys from `.env.example`

---

## Local Development

### 1. Start services
```bash
docker-compose up -d
# Starts postgres:15 on :5432 and redis:7 on :6379
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
cp .env.example .env
# Fill in all values
```

### 4. Run database migrations and seed
```bash
cd database
npx prisma migrate dev
npx ts-node seed.ts
```

### 5. Start development servers
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000

---

## Environment Variables

See `.env.example` at the project root for the complete list.

Critical variables:

```
DATABASE_URL          Supabase connection string (pooler)
DIRECT_URL            Supabase direct connection (for migrations)
REDIS_URL             Upstash or local Redis URL
JWT_SECRET            32+ char random string
NEXTAUTH_SECRET       32+ char random string
ANTHROPIC_API_KEY     Claude API key
OPENAI_API_KEY        OpenAI API key
GOOGLE_AI_API_KEY     Gemini API key
RAZORPAY_KEY_ID       Razorpay key ID
RAZORPAY_KEY_SECRET   Razorpay secret
```

---

## Production Deployment

### Frontend (Vercel)

```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Set NEXT_PUBLIC_API_URL to your Railway backend URL
# Deploy on push to main
```

Key Vercel settings:
- Framework preset: Next.js
- Build command: `cd frontend && npm run build`
- Output: `.next`
- Root directory: `frontend`

### Backend (Railway)

```bash
# Connect GitHub repo to Railway
# Set environment variables
# Dockerfile or Nixpacks auto-detection
```

`backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

Railway start command: `node dist/server.js`
Health check: `GET /health`

### Database (Supabase)

```bash
# In CI/CD pipeline (GitHub Actions):
npx prisma migrate deploy
```

Never run `migrate dev` in production. Only `migrate deploy`.

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm run build
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      - uses: railway deploy  # Railway GitHub Action

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Webhook Configuration

After deploying, register webhook URLs with payment providers:

**Razorpay Dashboard:**
```
https://api.adpilot.in/api/webhooks/razorpay
Events: payment.captured, subscription.activated, subscription.cancelled
```

**Stripe Dashboard:**
```
https://api.adpilot.in/api/webhooks/stripe
Events: customer.subscription.*, invoice.payment_*
```

---

## Scaling Notes

- **BullMQ workers**: Run as separate Railway services (`campaign-worker`, `audit-worker`) for independent scaling
- **Database connections**: Use PgBouncer (Supabase pooler) in production. Set `DATABASE_URL` to pooler URL, `DIRECT_URL` to direct URL
- **Redis**: Use Upstash Redis; it's serverless and handles BullMQ well
- **Rate limiting**: Redis-backed; scales automatically

---

## Monitoring Checklist

- [ ] Sentry DSN set for frontend and backend
- [ ] PostHog project key set
- [ ] Uptime monitor on `/health` endpoint
- [ ] Alert on Redis queue depth > 100
- [ ] Alert on AI provider error rate > 5%
- [ ] Alert on payment failure rate > 2%
- [ ] Daily credit consumption report
