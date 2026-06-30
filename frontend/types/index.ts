export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "publishing"
  | "live"
  | "paused"
  | "ended"
  | "failed";

export type CampaignGoal =
  | "leads"
  | "sales"
  | "calls"
  | "bookings"
  | "brand_awareness"
  | "website_traffic";

export type Platform = "google" | "meta" | "both";

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  goal: CampaignGoal;
  platform: Platform;
  status: CampaignStatus;
  dailyBudgetPaise: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  totalSpendPaise: number;
  festivalContext?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  business?: { id: string; name: string; city?: string | null; websiteUrl?: string | null } | null;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  businessType?: string;
  city?: string;
  state?: string;
  cityTier?: number;
  websiteUrl?: string;
  logoUrl?: string;
  googleAdsConnected: boolean;
  metaConnected: boolean;
  createdAt: string;
}

export interface Audit {
  id: string;
  businessId: string;
  url: string;
  status: "pending" | "crawling" | "analyzing" | "complete" | "failed";
  overallScore?: number;
  seoScore?: number;
  uxScore?: number;
  mobileScore?: number;
  speedScore?: number;
  conversionScore?: number;
  trustScore?: number;
  adReadinessScore?: number;
  criticalIssuesCount: number;
  pdfUrl?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreditInfo {
  balance: number;
  lifetimeUsed: number;
  resetDate: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "user" | "admin" | "superadmin";
  preferredLanguage: "en" | "hi" | "hinglish";
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    credits_used?: number;
    credits_remaining?: number;
  };
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
