"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import type { Campaign } from "@/types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Approved", value: "approved" },
  { label: "Live", value: "live" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

interface CampaignsResponse {
  data: Campaign[];
  meta: { total: number; page: number; limit: number };
}

export default function CampaignsPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns", status],
    queryFn: () =>
      apiClient.get<CampaignsResponse>(
        `/api/v1/campaigns?limit=50${status ? `&status=${status}` : ""}`
      ),
  });

  const campaigns = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
          )}
        </div>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + New Campaign
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
              status === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 bg-muted rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">Failed to load campaigns. Please refresh.</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center space-y-4">
          <div className="text-4xl">📢</div>
          <div>
            <p className="font-medium">
              {status ? `No ${status} campaigns` : "No campaigns yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {status
                ? "Try a different filter."
                : "Create your first AI-generated campaign in under 60 seconds."}
            </p>
          </div>
          {!status && (
            <Link
              href="/campaigns/new"
              className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
