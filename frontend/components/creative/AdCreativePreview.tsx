"use client";

import { useRef } from "react";
import { Download } from "lucide-react";

export interface CreativeData {
  headline: string;
  subheadline?: string;
  body_copy?: string;
  cta: string;
  badge_text?: string | null;
  color_palette: { primary: string; secondary: string; text_on_primary: string };
  hindi_headline?: string;
  image_url?: string | null;
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

export function AdCreativePreview({ creative, compact = false }: { creative: CreativeData; compact?: boolean }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const fmt = FORMAT_CONFIG[creative.format] ?? FORMAT_CONFIG.feed;
  const pal = creative.color_palette ?? { primary: "#ff6b35", secondary: "#f7c948", text_on_primary: "#ffffff" };
  const isStory = creative.format === "story";
  const isBanner = creative.format === "banner";

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
      {/* Format label */}
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

      {/* Ad canvas */}
      <div
        ref={previewRef}
        className={`relative overflow-hidden rounded-xl shadow-xl w-full ${fmt.aspect} ${compact ? "max-h-48" : ""}`}
        style={{ backgroundColor: pal.primary }}
      >
        {/* Background image */}
        {creative.image_url ? (
          <img
            src={creative.image_url}
            alt="Ad background"
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          /* Gradient fallback background */
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${pal.primary} 0%, ${pal.secondary} 100%)`,
            }}
          />
        )}

        {/* Overlay gradient for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: creative.image_url
              ? `linear-gradient(to ${isStory ? "top" : "right"}, ${pal.primary}ee 0%, ${pal.primary}88 50%, transparent 100%)`
              : `linear-gradient(135deg, ${pal.primary}cc 0%, transparent 60%)`,
          }}
        />

        {/* Badge */}
        {creative.badge_text && (
          <div
            className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-black shadow-lg"
            style={{ backgroundColor: pal.secondary, color: pal.primary === "#f8f9fa" ? "#212529" : "#fff" }}
          >
            {creative.badge_text}
          </div>
        )}

        {/* Content */}
        <div
          className={`absolute inset-0 flex flex-col justify-end p-4 ${isStory ? "p-6" : ""}`}
          style={{ color: pal.text_on_primary }}
        >
          {/* Hindi headline (small, top for story) */}
          {creative.hindi_headline && isStory && (
            <p className="text-xs font-medium opacity-80 mb-1">{creative.hindi_headline}</p>
          )}

          <div className="space-y-1">
            <h2
              className={`font-black leading-tight ${
                isBanner ? "text-sm" : isStory ? "text-2xl" : compact ? "text-base" : "text-xl"
              }`}
              style={{ textShadow: creative.image_url ? "0 1px 4px rgba(0,0,0,0.5)" : "none" }}
            >
              {creative.headline}
            </h2>

            {creative.subheadline && !isBanner && !compact && (
              <p
                className={`font-medium opacity-90 ${isStory ? "text-base" : "text-sm"}`}
                style={{ textShadow: creative.image_url ? "0 1px 3px rgba(0,0,0,0.4)" : "none" }}
              >
                {creative.subheadline}
              </p>
            )}

            {creative.body_copy && !isBanner && !compact && (
              <p
                className="text-xs opacity-80 leading-relaxed line-clamp-2 mt-1"
                style={{ textShadow: creative.image_url ? "0 1px 2px rgba(0,0,0,0.4)" : "none" }}
              >
                {creative.body_copy}
              </p>
            )}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              className="rounded-full px-4 py-1.5 text-xs font-black shadow-md"
              style={{
                backgroundColor: pal.secondary,
                color: pal.primary === "#f8f9fa" ? "#212529" : "#fff",
              }}
            >
              {creative.cta}
            </button>
            {creative.city && (
              <p className="text-[10px] opacity-60">📍 {creative.city}</p>
            )}
          </div>
        </div>

        {/* Platform watermark */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30 text-white/80 backdrop-blur-sm">
            {creative.platform === "google" ? "G" : "f"} Ad Preview
          </span>
        </div>
      </div>
    </div>
  );
}
