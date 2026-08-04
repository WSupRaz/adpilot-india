"use client";

import { useRef } from "react";
import { Download } from "lucide-react";

export interface CreativeData {
  headline: string;
  subheadline?: string;
  body_copy?: string;
  cta: string;
  badge_text?: string | null;
  usps?: string[];
  color_palette: { primary: string; secondary: string; text_on_primary: string };
  hindi_headline?: string;
  image_url?: string | null;
  logo_url?: string | null;
  business_name: string;
  city?: string | null;
  format: string;
  platform: string;
}

const FORMAT_CONFIG: Record<string, { label: string; aspect: string; width: number; height: number }> = {
  feed:   { label: "Meta Feed · 1:1",        aspect: "aspect-square",  width: 1080, height: 1080 },
  story:  { label: "Instagram Story · 9:16", aspect: "aspect-[9/16]",  width: 1080, height: 1920 },
  banner: { label: "Display Banner · 4:1",   aspect: "aspect-[4/1]",   width: 1200, height: 300  },
  square: { label: "Google Display · 1:1",   aspect: "aspect-square",  width: 1200, height: 1200 },
};

function extractUsps(creative: CreativeData): string[] {
  if (creative.usps?.length) return creative.usps.slice(0, 3);
  if (creative.body_copy) {
    const parts = creative.body_copy
      .split(/[.!•✓→|]/)
      .map((s) => s.trim().replace(/^[,\s]+/, ""))
      .filter((s) => s.length > 4 && s.length <= 28);
    if (parts.length >= 2) return parts.slice(0, 3);
  }
  if (creative.subheadline && creative.subheadline.length <= 30) {
    return [creative.subheadline];
  }
  return [];
}

export function AdCreativePreview({
  creative,
  compact = false,
}: {
  creative: CreativeData;
  compact?: boolean;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const fmt     = FORMAT_CONFIG[creative.format] ?? FORMAT_CONFIG.feed;
  const pal     = creative.color_palette ?? { primary: "#1a1a2e", secondary: "#e94560", text_on_primary: "#ffffff" };
  const isStory = creative.format === "story";
  const isBanner = creative.format === "banner";
  const usps    = extractUsps(creative);

  // Contrast color for badge/CTA text
  const accentTextColor = pal.primary === "#f8f9fa" || pal.primary === "#ffffff" ? "#1a1a2e" : "#ffffff";

  async function downloadPng() {
    if (!previewRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: pal.primary,
    });
    const link = document.createElement("a");
    link.download = `${creative.business_name.replace(/\s+/g, "-")}-ad-${creative.format}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">{fmt.label}</span>
          <button
            type="button"
            onClick={downloadPng}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Download PNG
          </button>
        </div>
      )}

      {/* ── Ad Canvas ── */}
      <div
        ref={previewRef}
        className={`relative overflow-hidden rounded-xl shadow-2xl w-full ${fmt.aspect} ${compact ? "max-h-44" : ""}`}
        style={{ backgroundColor: pal.primary }}
      >
        {/* ── Background ── */}
        {creative.image_url ? (
          <img
            src={creative.image_url}
            alt="Ad background"
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          /* Rich gradient fallback with geometric depth */
          <>
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(145deg, ${pal.primary} 0%, ${pal.secondary}cc 55%, ${pal.primary}ee 100%)` }}
            />
            {/* Decorative circles */}
            <div
              className="absolute -top-10 -right-10 rounded-full"
              style={{ width: isStory ? 220 : 180, height: isStory ? 220 : 180, backgroundColor: `${pal.secondary}30` }}
            />
            <div
              className="absolute -bottom-8 -left-8 rounded-full"
              style={{ width: 140, height: 140, backgroundColor: `${pal.text_on_primary}12` }}
            />
            <div
              className="absolute top-1/3 right-1/4 rounded-full"
              style={{ width: 60, height: 60, backgroundColor: `${pal.secondary}20` }}
            />
          </>
        )}

        {/* ── Dark overlay for text legibility ── */}
        <div
          className="absolute inset-0"
          style={{
            background: creative.image_url
              ? isStory
                ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 40%, rgba(0,0,0,0.15) 75%, transparent 100%)"
                : isBanner
                  ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.15) 100%)"
                  : "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.65) 42%, rgba(0,0,0,0.10) 75%, transparent 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
          }}
        />

        {/* ── Banner layout (horizontal) ── */}
        {isBanner ? (
          <div className="absolute inset-0 flex items-center px-4 gap-3 text-white">
            {creative.logo_url && (
              <img
                src={creative.logo_url}
                alt="Logo"
                className="h-7 w-auto max-w-[60px] object-contain rounded bg-white/90 p-0.5 shrink-0"
                crossOrigin="anonymous"
              />
            )}
            <div className="flex-1 min-w-0">
              <p
                className="font-black text-sm leading-tight truncate"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
              >
                {creative.headline}
              </p>
              {usps.length > 0 && (
                <p className="text-[10px] opacity-80 truncate mt-0.5">
                  {usps.map((u) => `✓ ${u}`).join("  ")}
                </p>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full px-3 py-1 text-xs font-black shadow-md whitespace-nowrap"
              style={{ backgroundColor: pal.secondary, color: accentTextColor }}
            >
              {creative.cta}
            </button>
            {creative.city && <p className="text-[9px] opacity-50 shrink-0">📍 {creative.city}</p>}
          </div>
        ) : (
          /* ── Feed / Story / Square layout ── */
          <>
            {/* Top bar: logo + badge */}
            <div className="absolute top-0 inset-x-0 flex items-start justify-between p-3">
              {/* Logo */}
              {creative.logo_url ? (
                <img
                  src={creative.logo_url}
                  alt="Logo"
                  className={`object-contain rounded-lg bg-white/90 p-1 shadow-md ${compact ? "h-6 max-w-[50px]" : "h-9 max-w-[80px]"}`}
                  crossOrigin="anonymous"
                />
              ) : (
                /* Platform watermark when no logo */
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30 text-white/80 backdrop-blur-sm">
                  {creative.platform === "google" ? "G" : "f"} Ad
                </span>
              )}

              {/* Badge */}
              {creative.badge_text && (
                <div
                  className={`rounded-full font-black shadow-lg ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"}`}
                  style={{ backgroundColor: pal.secondary, color: accentTextColor }}
                >
                  {creative.badge_text}
                </div>
              )}
            </div>

            {/* Bottom content */}
            <div
              className={`absolute inset-x-0 bottom-0 text-white ${isStory ? "p-5" : compact ? "p-2.5" : "p-4"}`}
            >
              {/* Hindi headline */}
              {creative.hindi_headline && !compact && (
                <p
                  className={`italic opacity-70 mb-1 ${isStory ? "text-xs" : "text-[10px]"}`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
                >
                  {creative.hindi_headline}
                </p>
              )}

              {/* Headline */}
              <h2
                className={`font-black leading-tight ${
                  compact ? "text-sm" : isStory ? "text-3xl mb-1" : "text-xl mb-1"
                }`}
                style={{ textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}
              >
                {creative.headline}
              </h2>

              {/* Subheadline */}
              {creative.subheadline && !compact && (
                <p
                  className={`opacity-90 mb-2 ${isStory ? "text-base" : "text-xs"}`}
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  {creative.subheadline}
                </p>
              )}

              {/* USP bullets */}
              {usps.length > 0 && !compact && (
                <div className={`flex flex-wrap gap-x-3 gap-y-1 mb-3 ${isStory ? "mb-4" : "mb-2.5"}`}>
                  {usps.map((usp, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-[11px] font-medium opacity-90"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                    >
                      <span style={{ color: pal.secondary }}>✓</span> {usp}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA row */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className={`rounded-full font-black shadow-lg ${
                    compact ? "px-3 py-1 text-[10px]" : "px-5 py-2 text-xs"
                  }`}
                  style={{ backgroundColor: pal.secondary, color: accentTextColor }}
                >
                  {creative.cta}
                </button>
                {creative.city && !compact && (
                  <p
                    className="text-[10px] opacity-60"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    📍 {creative.city}
                  </p>
                )}
              </div>
            </div>

            {/* Platform watermark when logo IS present */}
            {creative.logo_url && (
              <div className="absolute bottom-2 right-3">
                <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-black/20 text-white/50 backdrop-blur-sm">
                  {creative.platform === "google" ? "Google" : "Meta"} Ad
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
