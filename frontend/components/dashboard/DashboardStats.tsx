"use client";

import { Megaphone, MousePointerClick, IndianRupee, Zap, TrendingUp } from "lucide-react";

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
  sub,
  gradient,
  icon: Icon,
  pulse,
}: {
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  icon: React.ElementType;
  pulse?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-5 space-y-3 overflow-hidden ${gradient} text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-90">{label}</span>
        <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {pulse && (
          <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
            Live
          </span>
        )}
      </div>
      {sub && <p className="text-xs opacity-75">{sub}</p>}
      {/* Decorative circle */}
      <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 h-28 w-28 rounded-full bg-white/5" />
    </div>
  );
}

export function DashboardStats({ stats, creditsBalance }: DashboardStatsProps) {
  const spendRupees = (stats.totalSpendPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Campaigns"
        value={String(stats.totalCampaigns)}
        sub={stats.liveCampaigns > 0 ? `${stats.liveCampaigns} running right now` : "None live yet"}
        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        icon={Megaphone}
        pulse={stats.liveCampaigns > 0}
      />
      <StatCard
        label="Total Clicks"
        value={stats.totalClicks.toLocaleString("en-IN")}
        sub="People who clicked your ads"
        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        icon={MousePointerClick}
      />
      <StatCard
        label="Ad Spend"
        value={`₹${spendRupees}`}
        sub="Total invested in ads"
        gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        icon={IndianRupee}
      />
      <StatCard
        label="AI Credits"
        value={String(creditsBalance)}
        sub="Each campaign costs 15 credits"
        gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        icon={Zap}
      />
    </div>
  );
}
