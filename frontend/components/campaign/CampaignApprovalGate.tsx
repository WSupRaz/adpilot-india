"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface CampaignApprovalGateProps {
  campaignId: string;
  currentStatus?: string;
}

export function CampaignApprovalGate({
  campaignId,
  currentStatus = "draft",
}: CampaignApprovalGateProps) {
  const [approving, setApproving] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setApproving(true);
    try {
      await apiClient.post(`/api/v1/campaigns/${campaignId}/approve`, {});
      toast.success("Campaign approved! Publishing to ad platforms available in Phase 2.");
      router.refresh(); // Re-fetch server-component data to update status badge
    } catch (err: any) {
      toast.error(err?.message ?? "Approval failed. Please try again.");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-yellow-900 dark:text-yellow-200">
            Review Before Publishing
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Review the AI strategy, keywords, and ad copy below before approving. Once you
            approve, AdPilot will be ready to publish this campaign to Google/Meta the moment
            ad platform API access is available.
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            ⚡ Phase 1: Campaigns are saved in{" "}
            <strong>draft mode only</strong> — no real ad spend until Phase 2.
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          <CheckCircle2 className="h-4 w-4" />
          {approving ? "Approving..." : "Approve Campaign"}
        </button>
        <span className="text-xs text-muted-foreground">
          Status: <span className="capitalize font-medium">{currentStatus.replace("_", " ")}</span>
        </span>
      </div>
    </div>
  );
}
