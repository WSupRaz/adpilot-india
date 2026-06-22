"use client";

import { TrendingUp, Megaphone, CreditCard, MousePointerClick } from "lucide-react";

interface Stats {
  totalCampaigns: number;
  liveCampaigns: number;
  totalSpendPaise: number;
  totalClicks: number;
  totalConversions: number;
}

interface DashboardStatsProps {
  stats: Stats;
  creditsBalance: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function DashboardStats({ stats, creditsBalance }: DashboardStatsProps) {
  const spendRupees = (stats.totalSpendPaise / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Campaigns"
        value={String(stats.totalCampaigns)}
        icon={Megaphone}
        sub={stats.liveCampaigns > 0 ? `${stats.liveCampaigns} live` : "None live yet"}
      />
      <StatCard
        label="Total Clicks"
        value={stats.totalClicks.toLocaleString("en-IN")}
        icon={MousePointerClick}
        sub="Across all campaigns"
      />
      <StatCard
        label="Ad Spend"
        value={`₹${spendRupees}`}
        icon={CreditCard}
        sub="All time"
      />
      <StatCard
        label="AI Credits"
        value={String(creditsBalance)}
        icon={TrendingUp}
        sub="Available to use"
      />
    </div>
  );
}
