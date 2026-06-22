import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/api-client";
import { CreditMeter } from "@/components/shared/CreditMeter";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { FestivalAlert } from "@/components/dashboard/FestivalAlert";
import { OnboardingPrompt } from "@/components/dashboard/OnboardingPrompt";
import type { Campaign } from "@/types";

export const metadata: Metadata = { title: "Dashboard — AdPilot India" };

interface DashboardData {
  campaigns: { data: Campaign[] };
  credits: { data: { balance: number; reset_date: string | null } };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  // Fetch in parallel — both requests start simultaneously
  const [campaignsResult, creditsResult] = await Promise.allSettled([
    serverFetch<{ data: Campaign[]; meta: { total: number } }>(
      "/api/v1/campaigns?limit=5",
      token
    ),
    serverFetch<{ data: { balance: number; reset_date: string | null } }>(
      "/api/v1/credits",
      token
    ),
  ]);

  const campaigns =
    campaignsResult.status === "fulfilled" ? campaignsResult.value.data : [];
  const credits =
    creditsResult.status === "fulfilled"
      ? creditsResult.value.data
      : { balance: 0, reset_date: null };

  const hasNoBusiness = campaigns.length === 0;

  // Aggregate dashboard stats
  const stats = {
    totalCampaigns: campaigns.length,
    liveCampaigns: campaigns.filter((c) => c.status === "live").length,
    totalSpendPaise: campaigns.reduce((sum, c) => sum + (c.totalSpendPaise ?? 0), 0),
    totalClicks: campaigns.reduce((sum, c) => sum + Number(c.totalClicks ?? 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + (c.totalConversions ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your campaigns.
          </p>
        </div>
        <CreditMeter />
      </div>

      {/* Onboarding prompt for new users */}
      {hasNoBusiness && <OnboardingPrompt />}

      {/* Festival/season alert */}
      <FestivalAlert />

      {/* Stats grid */}
      <DashboardStats stats={stats} creditsBalance={credits.balance} />

      {/* Recent campaigns */}
      <RecentCampaigns campaigns={campaigns} />
    </div>
  );
}
