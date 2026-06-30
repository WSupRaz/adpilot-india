import { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/api-client";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { FestivalAlert } from "@/components/dashboard/FestivalAlert";
import { OnboardingPrompt } from "@/components/dashboard/OnboardingPrompt";
import type { Campaign } from "@/types";
import { Megaphone, Zap, BarChart2, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — AdPilot India" };

const QUICK_ACTIONS = [
  { href: "/campaigns/new", icon: Megaphone,  label: "New Campaign",      color: "text-orange-500 bg-orange-50" },
  { href: "/audit",         icon: BarChart2,  label: "Audit Website",     color: "text-blue-500 bg-blue-50" },
  { href: "/creatives",     icon: Zap,        label: "Generate Creative", color: "text-purple-500 bg-purple-50" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [campaignsResult, creditsResult] = await Promise.allSettled([
    serverFetch<{ data: Campaign[]; meta: { total: number } }>("/api/v1/campaigns?limit=6", token),
    serverFetch<{ data: { balance: number; reset_date: string | null } }>("/api/v1/credits", token),
  ]);

  const campaigns = campaignsResult.status === "fulfilled" ? campaignsResult.value.data : [];
  const credits   = creditsResult.status  === "fulfilled" ? creditsResult.value.data  : { balance: 0, reset_date: null };

  const liveCampaigns = campaigns.filter((c) => c.status === "live").length;

  const stats = {
    totalCampaigns: campaigns.length,
    liveCampaigns,
    totalSpendPaise:   campaigns.reduce((sum, c) => sum + (c.totalSpendPaise ?? 0), 0),
    totalClicks:       campaigns.reduce((sum, c) => sum + Number(c.totalClicks ?? 0), 0),
    totalConversions:  campaigns.reduce((sum, c) => sum + (c.totalConversions ?? 0), 0),
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-6 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80">{greeting} 👋</p>
          <h1 className="text-2xl font-bold mt-0.5">{firstName}</h1>
          <p className="text-sm opacity-80 mt-1">
            {liveCampaigns > 0
              ? `${liveCampaigns} campaign${liveCampaigns > 1 ? "s are" : " is"} running right now.`
              : "Ready to launch your next campaign?"}
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 mt-4 bg-white text-orange-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-md"
          >
            <Megaphone className="h-4 w-4" />
            Create Campaign
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {/* Decorative shapes */}
        <div className="absolute right-0 top-0 h-full flex items-center pr-6 opacity-10 pointer-events-none select-none">
          <span className="text-[120px] font-black">AI</span>
        </div>
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute right-16 -top-6 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Onboarding for new users */}
      {campaigns.length === 0 && <OnboardingPrompt />}

      {/* Festival / season alert */}
      <FestivalAlert />

      {/* Stats */}
      <DashboardStats stats={stats} creditsBalance={credits.balance} />

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all text-center group"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent campaigns */}
      <RecentCampaigns campaigns={campaigns} />

    </div>
  );
}
