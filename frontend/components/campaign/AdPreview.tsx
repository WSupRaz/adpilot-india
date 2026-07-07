"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface AdPreviewProps {
  campaign: {
    name: string;
    goal?: string;
    platform?: string;
    aiStrategy?: Record<string, unknown> | null;
    business?: { name: string; city?: string | null; websiteUrl?: string | null } | null;
  };
}

// ── Palette: vivid Indian-market gradients ─────────────────────────────────────
const PALETTES = [
  { from: "#d44000", to: "#ff8c00", text: "#ffffff", accent: "#ffe066" }, // saffron-orange
  { from: "#0f4c81", to: "#1a78c2", text: "#ffffff", accent: "#7dd3fc" }, // deep blue
  { from: "#006644", to: "#00a86b", text: "#ffffff", accent: "#bbf7d0" }, // emerald
  { from: "#5b21b6", to: "#9333ea", text: "#ffffff", accent: "#f0abfc" }, // royal purple
  { from: "#9d1b1b", to: "#e53e3e", text: "#ffffff", accent: "#fca5a5" }, // vermilion
  { from: "#065f46", to: "#0d9488", text: "#ffffff", accent: "#99f6e4" }, // teal
];

function pickPalette(name: string) {
  return PALETTES[name.charCodeAt(0) % PALETTES.length];
}

// ── Extract USPs from AI strategy ─────────────────────────────────────────────
function extractUsps(s: any, goal: string, businessType?: string): string[] {
  const usps: string[] = [];

  // Try ab_variants meta_ad primary_text — split into sentences
  const primaryText: string =
    s?.ab_variants?.[0]?.meta_ad?.primary_text ??
    s?.ab_variants?.[1]?.meta_ad?.primary_text ??
    s?.ads?.[1]?.primary_text ?? "";

  if (primaryText) {
    const sentences = primaryText
      .split(/[।.!\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 15 && s.length < 70 && !s.startsWith("http"));
    usps.push(...sentences.slice(0, 2));
  }

  // Try descriptions (v1 seed format)
  const descs: string[] = Array.isArray(s?.descriptions) ? s.descriptions : [];
  for (const d of descs) {
    const parts = d.split(/[।|]/).map((p: string) => p.trim()).filter((p: string) => p.length > 10 && p.length < 60);
    usps.push(...parts.slice(0, 2));
    if (usps.length >= 3) break;
  }

  // Try ad group themes
  const themes: string[] = [
    ...(s?.google?.ad_groups ?? []).map((ag: any) => ag.theme).filter(Boolean),
    ...(s?.adGroups ?? []).map((ag: any) => ag.theme).filter(Boolean),
  ];
  usps.push(...themes.slice(0, 2));

  // Try quick wins as USPs
  const wins: string[] = s?.india_intelligence?.quick_wins ?? s?.indiaIntelligence?.quick_wins ?? [];
  usps.push(...wins.filter((w: string) => w.length < 55).slice(0, 2));

  // Deduplicate and clean
  const seen = new Set<string>();
  const clean = usps
    .map((u) => u.replace(/^[\-\*•✓→\d\.\s]+/, "").trim())
    .filter((u) => u.length > 8 && u.length < 65 && !seen.has(u.toLowerCase().slice(0, 20)) && seen.add(u.toLowerCase().slice(0, 20)));

  if (clean.length >= 3) return clean.slice(0, 3);

  // Fallback USPs based on goal
  const fallbacks: Record<string, string[]> = {
    leads:           ["Free consultation — no commitment", "Response within 24 hours", "Trusted by local customers"],
    calls:           ["Call and get an instant quote", "Experts available 9am – 9pm", "No waiting, no queues"],
    bookings:        ["Easy online booking in 30 seconds", "Flexible slots available", "No advance payment needed"],
    sales:           ["Best prices guaranteed", "Fast delivery, happy customers", "Genuine products, genuine service"],
    brand_awareness: ["Serving the local community", "Quality you can count on", "Your neighbour's trusted choice"],
  };
  return [...clean, ...(fallbacks[goal] ?? fallbacks.leads)].slice(0, 3);
}

// ── Extract social proof number from copy ─────────────────────────────────────
function extractSocialProof(s: any, businessName: string): string | null {
  const allText = [
    ...(s?.headlines ?? []),
    ...(s?.descriptions ?? []),
    ...(s?.ab_variants?.map((v: any) => v.meta_ad?.primary_text ?? "") ?? []),
  ].join(" ");

  const patterns = [
    /(\d[\d,]+\+?\s*(?:customers?|students?|clients?|families|orders?))/i,
    /(\d+\+?\s*(?:years?|saal))/i,
    /(\d+\+?\s*(?:selections?|results?|placements?))/i,
    /(\d+\+?\s*(?:happy|satisfied|trusted))/i,
  ];
  for (const p of patterns) {
    const m = allText.match(p);
    if (m) return m[1];
  }

  // Seed-format: check expectedOutcomes or estimatedResults
  const est = s?.estimated_results ?? s?.estimatedResults;
  if (est?.conversions) return est.conversions.split(" ")[0] + " conversions expected";

  return null;
}

// ── Extract badge text ────────────────────────────────────────────────────────
function extractBadge(s: any, goal: string, festivalContext?: string): string {
  if (festivalContext) return `${festivalContext} Special`;
  const intel = s?.india_intelligence ?? s?.indiaIntelligence;
  if (intel?.festivalAlert && intel.festivalAlert !== "null") return "Festival Offer";
  const angle = s?.ab_variants?.[2]?.angle; // urgency variant
  if (angle === "Urgency / Local") return "Limited Slots";
  const badgeMap: Record<string, string> = {
    leads: "Free Quote", calls: "Call Today", bookings: "Book Now",
    sales: "Best Price", brand_awareness: "Now in Your City",
  };
  return badgeMap[goal] ?? "Special Offer";
}

// ── Meta creative card ─────────────────────────────────────────────────────────
function MetaCreative({
  businessName, city, headline, subline, usps, socialProof, badge, cta, pal, variantAngle,
}: {
  businessName: string; city: string; headline: string; subline: string;
  usps: string[]; socialProof: string | null; badge: string; cta: string;
  pal: typeof PALETTES[0]; variantAngle?: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${pal.from} 0%, ${pal.to} 100%)`,
        minHeight: "220px",
      }}
    >
      {/* Background texture: subtle dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20" style={{ background: pal.accent }} />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-15" style={{ background: "white" }} />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col gap-2.5" style={{ color: pal.text }}>

        {/* Top row: badge + variant tag */}
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{ backgroundColor: pal.accent, color: pal.from }}
          >
            {badge}
          </span>
          {variantAngle && (
            <span className="text-[9px] opacity-60 font-semibold uppercase tracking-wide">
              {variantAngle} angle
            </span>
          )}
        </div>

        {/* Main headline */}
        <div>
          <h3
            className="text-[17px] font-black leading-tight"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            {headline}
          </h3>
          {subline && (
            <p className="text-[12px] font-bold mt-0.5 opacity-90">{subline}</p>
          )}
        </div>

        {/* USP list */}
        <div className="space-y-1">
          {usps.map((usp, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2
                className="h-3 w-3 mt-0.5 shrink-0"
                style={{ color: pal.accent }}
              />
              <span className="text-[11px] font-medium leading-tight">{usp}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        {socialProof && (
          <div
            className="rounded-lg px-3 py-1.5 flex items-center gap-2"
            style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          >
            <span className="text-yellow-300 text-xs">⭐⭐⭐⭐⭐</span>
            <span className="text-[11px] font-semibold opacity-95">{socialProof}</span>
          </div>
        )}

        {/* CTA + location */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-[11px] font-black shadow-md"
            style={{ backgroundColor: "white", color: pal.from }}
          >
            {cta} →
          </button>
          <span className="text-[10px] opacity-70">📍 {city}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function AdPreview({ campaign }: AdPreviewProps) {
  const s = campaign.aiStrategy as any;
  const businessName = campaign.business?.name ?? campaign.name;
  const city = campaign.business?.city ?? "India";
  const goal = campaign.goal ?? "leads";
  const pal = pickPalette(businessName);

  const displayUrl = campaign.business?.websiteUrl
    ? campaign.business.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
    : `${businessName.toLowerCase().replace(/\s+/g, "").slice(0, 20)}.com`;

  // ── Headline sources ──
  const allHeadlines: string[] = [
    ...(s?.ab_variants?.flatMap((v: any) => [
      v.google_ad?.headline_1, v.google_ad?.headline_2, v.google_ad?.headline_3,
    ]) ?? []),
    ...(s?.headlines ?? []),
    ...(s?.ads?.[0]?.headlines ?? []),
  ].filter(Boolean);

  const googleHeadlines = allHeadlines.length > 0 ? allHeadlines : [
    `${businessName} — ${city}`,
    `Best ${campaign.name} Service`,
    "Call Now · Free Consultation",
  ];

  const descriptions: string[] =
    Array.isArray(s?.descriptions) ? s.descriptions :
    Array.isArray(s?.ads?.[0]?.descriptions) ? s.ads[0].descriptions :
    s?.ab_variants?.[0]?.google_ad
      ? [
          `${s.ab_variants[0].google_ad.description_1 ?? ""}`,
          `${s.ab_variants[0].google_ad.description_2 ?? ""}`,
        ].filter(Boolean)
      : [`Professional ${goal === "sales" ? "products" : "service"} from ${businessName} in ${city}. Trusted by hundreds of satisfied customers. Contact us today.`];

  // ── AB variant tab state ──
  const abVariants = Array.isArray(s?.ab_variants) ? s.ab_variants : [];
  const [activeVariant, setActiveVariant] = useState(0);
  const currentVariant = abVariants[activeVariant];

  // ── Meta ad copy (with variant support) ──
  const metaHeadline: string =
    currentVariant?.meta_ad?.headline ??
    s?.ads?.[1]?.headline ??
    googleHeadlines[0];

  const metaSubline: string =
    currentVariant?.meta_ad?.primary_text?.split(/[।\n]/)?.[0]?.slice(0, 60) ?? "";

  const metaCta: string =
    (currentVariant?.meta_ad?.cta_button ?? "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
    (goal === "calls" ? "Call Now" : goal === "bookings" ? "Book Now" : goal === "sales" ? "Shop Now" : "Get Quote");

  const metaPrimaryText: string =
    currentVariant?.meta_ad?.primary_text ??
    s?.ads?.[1]?.primary_text ??
    (descriptions[0] ?? "");

  const linkCardHeadline: string =
    currentVariant?.meta_ad?.headline ?? s?.ads?.[1]?.headline ?? googleHeadlines[0];

  // ── Derived content ──
  const usps = extractUsps(s, goal);
  const socialProof = extractSocialProof(s, businessName);
  const badge = extractBadge(s, goal, s?.festivalContext);

  // ── Keyword chip for Google preview ──
  const googleKeywords: string[] =
    Array.isArray(s?.google?.keywords) ? s.google.keywords.slice(0, 3) :
    Array.isArray(s?.keywords?.google) ? s.keywords.google.slice(0, 3) : [];

  const showGoogle = !campaign.platform || campaign.platform === "google" || campaign.platform === "both";
  const showMeta   = !campaign.platform || campaign.platform === "meta"   || campaign.platform === "both";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Ad Previews</h2>
      <p className="text-xs text-muted-foreground -mt-4">
        How your ads will appear to customers on each platform.
      </p>

      {/* ── A/B variant tabs ── */}
      {abVariants.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground self-center mr-1">Showing:</span>
          {abVariants.map((v: any, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveVariant(i)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                activeVariant === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-muted-foreground"
              }`}
            >
              {v.variant}: {v.angle}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Google Search Ad ── */}
        {showGoogle && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center text-white text-[10px] font-black">G</div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Google Search Ad</span>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden dark:bg-gray-950 dark:border-gray-800">
              {/* Fake browser chrome */}
              <div className="bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-800 px-3 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded bg-white dark:bg-gray-800 border dark:border-gray-700 text-[10px] px-2 py-0.5 text-gray-400 truncate">
                  google.com/search?q={(googleKeywords[0] ?? businessName.toLowerCase()).replace(/\s+/g, "+")}
                </div>
              </div>

              {/* Search result */}
              <div className="p-4 space-y-1.5 bg-white dark:bg-gray-950">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] border border-[#006621] text-[#006621] rounded px-1 font-bold">Ad</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{displayUrl}</span>
                  <span className="text-gray-400 text-xs">›</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{city}</span>
                </div>
                <p className="text-[#1a0dab] dark:text-blue-400 text-base font-normal hover:underline cursor-pointer leading-tight">
                  {currentVariant?.google_ad?.headline_1
                    ? `${currentVariant.google_ad.headline_1} | ${currentVariant.google_ad.headline_2}`
                    : googleHeadlines[0]}
                </p>
                <p className="text-[#006621] dark:text-green-500 text-xs">{displayUrl}/{city.toLowerCase().replace(/\s+/g, "-")}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentVariant?.google_ad?.description_1 ?? descriptions[0]}
                </p>
                {currentVariant?.google_ad?.description_2 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {currentVariant.google_ad.description_2}
                  </p>
                )}
                {/* Sitelinks */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  {["Contact Us", "About Us", "Our Services", "Get Quote"].map((link) => (
                    <span key={link} className="text-[#1a0dab] dark:text-blue-400 text-xs hover:underline cursor-pointer">{link}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* All headlines list */}
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">All Headlines</p>
              {(currentVariant
                ? [currentVariant.google_ad?.headline_1, currentVariant.google_ad?.headline_2, currentVariant.google_ad?.headline_3].filter(Boolean)
                : googleHeadlines.slice(0, 4)
              ).map((h: string, i: number) => (
                <p key={i} className="text-xs">• {h}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Meta Feed Ad ── */}
        {showMeta && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">f</div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Facebook / Instagram Ad</span>
            </div>

            <div className="rounded-xl border bg-white dark:bg-gray-950 dark:border-gray-800 shadow-sm overflow-hidden max-w-sm">
              {/* Post header */}
              <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})` }}
                >
                  {businessName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{businessName}</p>
                  <p className="text-[10px] text-gray-500">Sponsored · <span className="text-blue-500">✦</span></p>
                </div>
                <div className="ml-auto text-gray-400 text-lg">···</div>
              </div>

              {/* Post text */}
              {metaPrimaryText && (
                <p className="text-xs text-gray-800 dark:text-gray-300 px-3 pb-2 leading-relaxed line-clamp-3">
                  {metaPrimaryText}
                </p>
              )}

              {/* ── Information-rich creative image ── */}
              <MetaCreative
                businessName={businessName}
                city={city}
                headline={metaHeadline}
                subline={metaSubline}
                usps={usps}
                socialProof={socialProof}
                badge={badge}
                cta={metaCta}
                pal={pal}
                variantAngle={currentVariant?.angle}
              />

              {/* Link card */}
              <div className="border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between px-3 py-2.5 gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase truncate">{displayUrl}</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{linkCardHeadline}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  {metaCta}
                </button>
              </div>

              {/* Engagement bar */}
              <div className="flex items-center justify-around border-t dark:border-gray-800 px-3 py-2 text-[11px] text-gray-500">
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">🔥 Like</button>
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">💬 Comment</button>
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors">↗ Share</button>
              </div>
            </div>

            {/* Visual direction note */}
            {currentVariant?.meta_ad?.visual_direction && (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 px-3 py-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Visual Direction</p>
                <p className="text-xs text-muted-foreground italic">{currentVariant.meta_ad.visual_direction}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
