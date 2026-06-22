import Link from "next/link";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import type { Campaign } from "@/types";

interface RecentCampaignsProps {
  campaigns: Campaign[];
}

export function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Campaigns</h2>
        {campaigns.length > 0 && (
          <Link
            href="/campaigns"
            className="text-sm text-primary hover:underline font-medium"
          >
            View all →
          </Link>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
          <p className="text-muted-foreground">No campaigns yet.</p>
          <Link
            href="/campaigns/new"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </section>
  );
}
