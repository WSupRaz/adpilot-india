import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/api-client";
import { CampaignApprovalGate } from "@/components/campaign/CampaignApprovalGate";
import { AdPreview } from "@/components/campaign/AdPreview";
import { CampaignStrategyPanel } from "@/components/campaign/CampaignStrategyPanel";
import type { Campaign } from "@/types";

export const metadata: Metadata = { title: "Campaign Details — AdPilot India" };

interface CampaignDetailResponse {
  data: Campaign & {
    aiStrategy: Record<string, unknown> | null;
    aiModelUsed: string | null;
    business: {
      id: string;
      name: string;
      city: string | null;
      businessType: string | null;
      websiteUrl: string | null;
    };
  };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft:          { label: "Draft",          className: "bg-muted text-muted-foreground" },
  pending_review: { label: "Pending Review", className: "bg-yellow-100 text-yellow-700" },
  approved:       { label: "Approved",       className: "bg-blue-100 text-blue-700" },
  publishing:     { label: "Publishing",     className: "bg-purple-100 text-purple-700" },
  live:           { label: "Live",           className: "bg-green-100 text-green-700" },
  paused:         { label: "Paused",         className: "bg-orange-100 text-orange-700" },
  ended:          { label: "Ended",          className: "bg-gray-100 text-gray-500" },
  failed:         { label: "Failed",         className: "bg-red-100 text-red-700" },
};

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  let campaign: CampaignDetailResponse["data"] | null = null;
  try {
    const result = await serverFetch<CampaignDetailResponse>(
      `/api/v1/campaigns/${params.id}`,
      token
    );
    campaign = result.data;
  } catch {
    notFound();
  }

  if (!campaign) notFound();

  const statusInfo = STATUS_LABELS[campaign.status] ?? STATUS_LABELS.draft;
  const isDraft = campaign.status === "draft" || campaign.status === "pending_review";
  const isApproved = campaign.status === "approved" || campaign.status === "live";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {campaign.business.name}
            {campaign.business.city ? ` · ${campaign.business.city}` : ""}
            {" · "}
            <span className="capitalize">{campaign.goal}</span>
            {" on "}
            <span className="capitalize">{campaign.platform}</span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Budget + dates summary */}
      <div className="grid grid-cols-3 gap-4 rounded-xl border p-4">
        <div>
          <p className="text-xs text-muted-foreground">Daily Budget</p>
          <p className="font-semibold mt-0.5">
            ₹{(campaign.dailyBudgetPaise / 100).toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Start Date</p>
          <p className="font-semibold mt-0.5">
            {campaign.startDate
              ? new Date(campaign.startDate).toLocaleDateString("en-IN")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">End Date</p>
          <p className="font-semibold mt-0.5">
            {campaign.endDate
              ? new Date(campaign.endDate).toLocaleDateString("en-IN")
              : "Ongoing"}
          </p>
        </div>
      </div>

      {/* India Intelligence badge */}
      {campaign.festivalContext && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 px-4 py-2 text-sm">
          <span className="text-orange-500">✨</span>
          <span className="text-orange-800 dark:text-orange-200">
            Optimised for <strong>{campaign.festivalContext}</strong> season
          </span>
        </div>
      )}

      {/* Approval gate — only show if campaign is in a reviewable state */}
      {isDraft && (
        <CampaignApprovalGate campaignId={campaign.id} currentStatus={campaign.status} />
      )}

      {isApproved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 px-4 py-2 text-sm text-green-800 dark:text-green-200">
          <span>✅</span>
          <span>Campaign approved. Publishing to ad platforms available in Phase 2.</span>
        </div>
      )}

      {/* AI Strategy Panel */}
      {campaign.aiStrategy && (
        <CampaignStrategyPanel strategy={campaign.aiStrategy} />
      )}

      {/* Ad Previews */}
      <AdPreview campaign={campaign} />
    </div>
  );
}
