import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),

  // ── Database (required) ─────────────────────────────────────────────────────
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // ── Redis (required) ────────────────────────────────────────────────────────
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // ── Auth (required) ─────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),

  // ── Google OAuth (optional — only needed for Google login) ──────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── AI providers (at least one required for campaign generation) ─────────────
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  AI_DEFAULT_PROVIDER: z
    .enum(["openai", "anthropic", "google", "openrouter"])
    .default("anthropic"),

  // ── Payments (optional — only needed for billing features) ──────────────────
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ── Email (optional — only needed for password reset/notifications) ──────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("noreply@adpilotindia.com"),

  // ── SMS (optional) ──────────────────────────────────────────────────────────
  MSG91_API_KEY: z.string().optional(),

  // ── Storage (optional — only needed for PDF uploads) ────────────────────────
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default("adpilot-india"),
  R2_PUBLIC_URL: z.string().url().default("https://pub.adpilotindia.com"),

  // ── Monitoring (optional) ───────────────────────────────────────────────────
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Invalid environment variables:\n");
  for (const [field, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`  ${field}: ${(errors as string[]).join(", ")}`);
  }
  console.error("\nCheck your .env file and try again.\n");
  process.exit(1);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  frontendUrl: env.FRONTEND_URL,
  sentryDsn: env.SENTRY_DSN,

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
  },

  ai: {
    openaiKey: env.OPENAI_API_KEY ?? "",
    anthropicKey: env.ANTHROPIC_API_KEY ?? "",
    googleKey: env.GOOGLE_AI_API_KEY ?? "",
    openrouterKey: env.OPENROUTER_API_KEY ?? "",
    defaultProvider: env.AI_DEFAULT_PROVIDER,
  },

  razorpay: {
    keyId: env.RAZORPAY_KEY_ID ?? "",
    keySecret: env.RAZORPAY_KEY_SECRET ?? "",
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET ?? "",
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "",
  },

  resend: {
    apiKey: env.RESEND_API_KEY ?? "",
    fromEmail: env.RESEND_FROM_EMAIL,
  },

  msg91: {
    apiKey: env.MSG91_API_KEY ?? "",
  },

  r2: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID ?? "",
    accessKeyId: env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: env.R2_BUCKET_NAME,
    publicUrl: env.R2_PUBLIC_URL,
  },
} as const;
