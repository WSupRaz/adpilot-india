"use client";

interface AdPreviewProps {
  campaign: {
    name: string;
    aiStrategy?: Record<string, unknown> | null;
    business?: { name: string; websiteUrl?: string | null } | null;
  };
}

interface AIAd {
  type?: string;
  headlines?: string[];
  descriptions?: string[];
  primary_text?: string;
  headline?: string;
  cta?: string;
  display_url?: string;
  final_url?: string;
}

export function AdPreview({ campaign }: AdPreviewProps) {
  const strategy = campaign.aiStrategy as any;
  const ads: AIAd[] = Array.isArray(strategy?.ads) ? strategy.ads : [];
  const businessName = campaign.business?.name ?? campaign.name;
  const displayUrl = campaign.business?.websiteUrl
    ? new URL(campaign.business.websiteUrl).hostname.replace("www.", "")
    : "yourwebsite.com";

  const googleAd = ads.find(
    (a) =>
      a.type === "google_responsive_search" ||
      (Array.isArray(a.headlines) && a.headlines.length > 0)
  );

  const metaAd = ads.find(
    (a) => a.type?.startsWith("meta") || typeof a.primary_text === "string"
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ad Previews</h2>

      {/* Google RSA Preview */}
      <div className="rounded-xl border p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="rounded border border-green-700 px-1 text-green-700 font-bold text-[10px]">
            Ad
          </span>
          <span className="text-muted-foreground">{displayUrl}</span>
        </div>
        <p className="text-blue-600 font-medium text-sm hover:underline cursor-pointer">
          {googleAd?.headlines?.slice(0, 3).join(" | ") ??
            `${businessName} | Best Offers | Call Now`}
        </p>
        <p className="text-xs text-gray-700 leading-relaxed">
          {googleAd?.descriptions?.[0] ??
            `${businessName} — Professional service you can trust. Get in touch today for a free consultation.`}
        </p>
        {googleAd?.descriptions?.[1] && (
          <p className="text-xs text-gray-700">{googleAd.descriptions[1]}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1 pt-1 border-t">
          Google Search Ad Preview
        </p>
      </div>

      {/* Meta Feed Preview */}
      <div className="rounded-xl border p-4 space-y-3 max-w-sm">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {businessName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold">{businessName}</p>
            <p className="text-[10px] text-muted-foreground">Sponsored · ✦</p>
          </div>
        </div>
        <p className="text-sm">
          {metaAd?.primary_text ??
            ads[0]?.primary_text ??
            `Looking for the best ${businessName}? We offer professional service with guaranteed results. Contact us today!`}
        </p>
        <div className="rounded-lg bg-muted aspect-[1.91/1] flex items-center justify-center text-xs text-muted-foreground">
          Ad Creative (image/video)
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-xs font-semibold">
              {metaAd?.headline ?? ads[0]?.headline ?? businessName}
            </p>
            <p className="text-[10px] text-muted-foreground">{displayUrl}</p>
          </div>
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {metaAd?.cta ?? "Learn More"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Meta Feed Ad Preview</p>
      </div>

      {ads.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Ad previews shown above use template text. AI-generated copy will appear here once
          generation is complete.
        </p>
      )}
    </div>
  );
}
