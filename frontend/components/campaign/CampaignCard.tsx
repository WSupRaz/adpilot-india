import Link from "next/link";
import { Campaign } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, MousePointerClick, IndianRupee } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  draft:          { label: "Draft",          dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600" },
  pending_review: { label: "Pending Review", dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700" },
  approved:       { label: "Approved",       dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700" },
  live:           { label: "Live",           dot: "bg-green-400 animate-pulse", badge: "bg-green-50 text-green-700" },
  paused:         { label: "Paused",         dot: "bg-orange-400", badge: "bg-orange-50 text-orange-700" },
  ended:          { label: "Ended",          dot: "bg-gray-300",   badge: "bg-gray-50 text-gray-500" },
  failed:         { label: "Failed",         dot: "bg-red-400",    badge: "bg-red-50 text-red-700" },
};

const GOAL_EMOJI: Record<string, string> = {
  leads: "📋", sales: "🛒", calls: "📞", bookings: "📅", brand_awareness: "📢", footfall: "🏪",
};

const PLATFORM_LABEL: Record<string, string> = {
  google: "Google", meta: "Meta", both: "Google + Meta",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const status = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
  const goalEmoji = GOAL_EMOJI[campaign.goal] ?? "🎯";
  const clicks = Number(campaign.totalClicks ?? 0);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="group rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden">

        {/* Top color strip based on status */}
        <div className={`h-1 w-full ${campaign.status === "live" ? "bg-gradient-to-r from-green-400 to-emerald-500" : campaign.status === "approved" ? "bg-gradient-to-r from-blue-400 to-blue-500" : "bg-gradient-to-r from-orange-300 to-orange-400"}`} />

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                {campaign.business?.name ?? "—"} · {PLATFORM_LABEL[campaign.platform] ?? campaign.platform}
              </p>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {goalEmoji} {campaign.name}
              </h3>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Budget/day</p>
              <p className="text-sm font-bold">₹{(campaign.dailyBudgetPaise / 100).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Clicks</p>
              <p className="text-sm font-bold">{clicks.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Conversions</p>
              <p className="text-sm font-bold">{campaign.totalConversions ?? 0}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
            </p>
            {campaign.festivalContext && (
              <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                🪔 {campaign.festivalContext}
              </span>
            )}
            <span className="text-[11px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
