"use client";

interface AdPreviewProps {
  campaign: {
    name: string;
    goal?: string;
    platform?: string;
    aiStrategy?: Record<string, unknown> | null;
    business?: { name: string; city?: string | null; websiteUrl?: string | null } | null;
  };
}

export function AdPreview({ campaign }: AdPreviewProps) {
  const s = campaign.aiStrategy as any;
  const businessName = campaign.business?.name ?? campaign.name;
  const city = campaign.business?.city ?? "India";
  const displayUrl = campaign.business?.websiteUrl
    ? campaign.business.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
    : `${businessName.toLowerCase().replace(/\s+/g, "")}.com`;

  // Support both seed-format and AI-generated format
  const headlines: string[] =
    Array.isArray(s?.headlines) ? s.headlines :
    Array.isArray(s?.ads?.[0]?.headlines) ? s.ads[0].headlines :
    [`${businessName} — Best Offers in ${city}`, `Call Now | ${businessName}`, `Top Rated | ${businessName} | ${city}`];

  const descriptions: string[] =
    Array.isArray(s?.descriptions) ? s.descriptions :
    Array.isArray(s?.ads?.[0]?.descriptions) ? s.ads[0].descriptions :
    [`Professional service you can trust. Serving ${city} for years. Contact us today for the best deals and offers.`];

  const primaryText: string =
    typeof s?.ads?.[1]?.primary_text === "string" ? s.ads[1].primary_text :
    Array.isArray(s?.descriptions) ? s.descriptions[1] ?? s.descriptions[0] :
    `Looking for the best ${businessName}? We offer guaranteed results and professional service. Contact us today!`;

  const metaHeadline: string =
    typeof s?.ads?.[1]?.headline === "string" ? s.ads[1].headline :
    headlines[0];

  const cta: string =
    typeof s?.ads?.[1]?.cta === "string" ? s.ads[1].cta :
    campaign.goal === "calls" ? "Call Now" :
    campaign.goal === "leads" ? "Get Quote" :
    campaign.goal === "bookings" ? "Book Now" :
    "Learn More";

  const googleKeywords: string[] =
    Array.isArray(s?.keywords?.google) ? s.keywords.google.slice(0, 3) :
    Array.isArray(s?.google?.keywords) ? s.google.keywords.slice(0, 3) :
    [];

  // Generate a gradient color based on business name (consistent per business)
  const gradients = [
    "from-orange-400 to-pink-500",
    "from-blue-400 to-indigo-600",
    "from-emerald-400 to-teal-600",
    "from-purple-400 to-violet-600",
    "from-amber-400 to-orange-500",
  ];
  const gradientIdx = businessName.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIdx];

  const showGoogle = !campaign.platform || campaign.platform === "google" || campaign.platform === "both";
  const showMeta   = !campaign.platform || campaign.platform === "meta"   || campaign.platform === "both";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Ad Previews</h2>
      <p className="text-xs text-muted-foreground -mt-4">
        How your ads will appear to customers on each platform.
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Google Search Ad ── */}
        {showGoogle && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center text-white text-[10px] font-black">G</div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Google Search Ad</span>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {/* Fake browser chrome */}
              <div className="bg-gray-100 border-b px-3 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded bg-white border text-[10px] px-2 py-0.5 text-gray-400 truncate">
                  google.com/search?q={(googleKeywords[0] ?? businessName.toLowerCase()).replace(/\s+/g, "+")}
                </div>
              </div>

              {/* Search result */}
              <div className="p-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] border border-[#006621] text-[#006621] rounded px-1 font-bold">Ad</span>
                  <span className="text-xs text-gray-600">{displayUrl}</span>
                  <span className="text-gray-400 text-xs">›</span>
                  <span className="text-xs text-gray-600">{city}</span>
                </div>
                <p className="text-[#1a0dab] text-base font-normal hover:underline cursor-pointer leading-tight">
                  {headlines[0]}
                </p>
                <p className="text-[#006621] text-xs">{displayUrl}/{city.toLowerCase()}</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {descriptions[0]}
                </p>
                {/* Sitelinks */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  {["Contact Us", "About Us", "Our Services", "Get Quote"].map((link) => (
                    <span key={link} className="text-[#1a0dab] text-xs hover:underline cursor-pointer">{link}</span>
                  ))}
                </div>
              </div>
            </div>

            {headlines.length > 1 && (
              <div className="rounded-lg bg-muted/40 px-3 py-2 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">All Headlines</p>
                {headlines.slice(0, 4).map((h, i) => (
                  <p key={i} className="text-xs text-foreground">• {h}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Meta Feed Ad ── */}
        {showMeta && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">f</div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Facebook / Instagram Ad</span>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden max-w-sm">
              {/* Post header */}
              <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {businessName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{businessName}</p>
                  <p className="text-[10px] text-gray-500">Sponsored · <span className="text-blue-500">✦</span></p>
                </div>
                <div className="ml-auto text-gray-400 text-lg">···</div>
              </div>

              {/* Post text */}
              <p className="text-xs text-gray-800 px-3 pb-2 leading-relaxed">{primaryText}</p>

              {/* Ad creative — gradient with text overlay */}
              <div className={`relative bg-gradient-to-br ${gradient} aspect-[1.91/1] flex flex-col items-center justify-center text-white px-4`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative text-center space-y-1">
                  <p className="text-lg font-black drop-shadow-md leading-tight">{businessName}</p>
                  <p className="text-xs font-medium opacity-90 drop-shadow">{city}</p>
                  <div className="mt-2 bg-white/20 backdrop-blur rounded-full px-4 py-1 text-xs font-bold">
                    {cta}
                  </div>
                </div>
              </div>

              {/* Link card */}
              <div className="border-t bg-gray-50 flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{displayUrl}</p>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">{metaHeadline}</p>
                </div>
                <button type="button" className="shrink-0 ml-2 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white">
                  {cta}
                </button>
              </div>

              {/* Engagement bar */}
              <div className="flex items-center justify-around border-t px-3 py-2 text-[11px] text-gray-500">
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">👍 Like</button>
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">💬 Comment</button>
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">↗ Share</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
