import Link from "next/link";
import { Campaign } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface CampaignCardProps {
  campaign: Campaign;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-700",
  live: "bg-green-100 text-green-700",
  paused: "bg-blue-100 text-blue-700",
  ended: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-700",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="rounded-lg border p-4 hover:border-primary/50 hover:shadow-sm transition-all space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{campaign.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {campaign.platform} · {campaign.goal}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              STATUS_STYLES[campaign.status] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {campaign.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Daily Budget</p>
            <p className="font-medium">₹{(campaign.dailyBudgetPaise / 100).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Clicks</p>
            <p className="font-medium">{campaign.totalClicks.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conversions</p>
            <p className="font-medium">{campaign.totalConversions}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
}
