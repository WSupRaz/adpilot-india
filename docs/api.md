# AdPilot India — API Reference

## Base URL

```
Development: http://localhost:4000/api/v1
Production:  https://api.adpilot.in/api/v1
```

All responses use the envelope format:

```json
// Success
{ "success": true, "data": {}, "meta": {} }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Resource not found" } }
```

---

## Authentication

All endpoints (except `/auth/*` and `/health`) require:

```
Authorization: Bearer <jwt_access_token>
```

Tokens expire in 15 minutes. Use the refresh endpoint to obtain a new access token.

---

## Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with email + password |
| POST | `/auth/login` | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update profile |
| PUT | `/users/me/password` | Change password |

### Businesses

| Method | Path | Description |
|--------|------|-------------|
| GET | `/businesses` | List user's businesses |
| POST | `/businesses` | Create business |
| GET | `/businesses/:id` | Get business |
| PUT | `/businesses/:id` | Update business |
| DELETE | `/businesses/:id` | Delete business |
| POST | `/businesses/:id/connect-google` | Connect Google Ads |
| POST | `/businesses/:id/connect-meta` | Connect Meta Ads |

### Campaigns

| Method | Path | Description |
|--------|------|-------------|
| GET | `/campaigns?businessId=` | List campaigns |
| POST | `/campaigns` | Create + generate campaign (async) |
| GET | `/campaigns/:id` | Get campaign + ad groups |
| PUT | `/campaigns/:id` | Update campaign |
| POST | `/campaigns/:id/approve` | Approve and publish |
| POST | `/campaigns/:id/pause` | Pause live campaign |
| DELETE | `/campaigns/:id` | Archive campaign |

**POST /campaigns request body:**
```json
{
  "businessId": "uuid",
  "name": "Summer Sale 2025",
  "goal": "leads",
  "platform": "meta",
  "dailyBudgetPaise": 50000,
  "startDate": "2025-07-01",
  "endDate": "2025-07-31"
}
```

**Response:** `{ data: { jobId: "..." } }` — use Jobs endpoint to poll.

### Audits

| Method | Path | Description |
|--------|------|-------------|
| GET | `/audits?businessId=` | List audits |
| POST | `/audits` | Create audit (async) |
| GET | `/audits/:id` | Get audit + issues |
| GET | `/audits/:id/pdf` | Download PDF report |

### Creatives

| Method | Path | Description |
|--------|------|-------------|
| GET | `/creatives?businessId=` | List creatives |
| POST | `/creatives` | Generate creative brief (async) |
| GET | `/creatives/:id` | Get creative |
| DELETE | `/creatives/:id` | Delete creative |

### Competitor Analysis

| Method | Path | Description |
|--------|------|-------------|
| GET | `/competitors?businessId=` | List analyses |
| POST | `/competitors` | Run analysis (async) |
| GET | `/competitors/:id` | Get analysis |

### Growth Plans

| Method | Path | Description |
|--------|------|-------------|
| GET | `/growth-plans?businessId=` | List plans |
| POST | `/growth-plans` | Generate plan (async) |
| GET | `/growth-plans/:id` | Get plan |

### Jobs (Async Status)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs/:jobId/status` | Poll job status |

**Response:**
```json
{
  "data": {
    "status": "processing",
    "progress": 65,
    "message": "Generating ad copy...",
    "resultId": null
  }
}
```

Status values: `pending` → `processing` → `complete` | `failed`

### Credits

| Method | Path | Description |
|--------|------|-------------|
| GET | `/credits` | Get balance + usage |
| GET | `/credits/transactions` | Credit transaction history |

### Billing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/plans` | List plans + pricing |
| POST | `/billing/subscribe` | Create Razorpay/Stripe subscription |
| PUT | `/billing/subscription` | Change plan |
| DELETE | `/billing/subscription` | Cancel subscription |
| GET | `/billing/invoices` | List invoices |

### India Intelligence

| Method | Path | Description |
|--------|------|-------------|
| GET | `/india/upcoming-events?businessType=&cityTier=` | Festival calendar |

### Webhooks (no auth — HMAC verified)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/razorpay` | Razorpay payment events |
| POST | `/webhooks/stripe` | Stripe payment events |
| POST | `/webhooks/meta` | Meta lead form events |
| POST | `/webhooks/waba` | WhatsApp Business events |

---

## Admin Endpoints

Base: `/api/admin` — requires `superadmin` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id` | Update user (ban, change role) |
| GET | `/admin/analytics` | Platform usage stats |
| GET | `/admin/ai-usage` | AI cost breakdown |
| GET | `/admin/jobs` | All queued jobs |

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| Global | 200 requests / 15 min |
| Auth endpoints | 10 requests / 15 min |
| AI endpoints | 10 requests / min |

Rate limit headers:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1720000000
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `AUTH_REQUIRED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits for operation |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_ERROR` | 503 | All AI providers failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
