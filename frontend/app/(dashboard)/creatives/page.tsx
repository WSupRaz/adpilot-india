"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wand2, Loader2, Image as ImageIcon, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AdCreativePreview, type CreativeData } from "@/components/creative/AdCreativePreview";
import type { Business } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORMS = [
  { value: "meta",   label: "Meta",   icon: "f", color: "bg-blue-600 text-white" },
  { value: "google", label: "Google", icon: "G", color: "bg-red-500 text-white" },
];

const FORMATS = [
  { value: "feed",   label: "Feed Post",   sub: "1:1 square", platforms: ["meta", "google"] },
  { value: "story",  label: "Story / Reel", sub: "9:16 vertical", platforms: ["meta"] },
  { value: "banner", label: "Display Banner", sub: "4:1 horizontal", platforms: ["google"] },
  { value: "square", label: "Display Square", sub: "1:1 display", platforms: ["google"] },
];

const STYLES = [
  { value: "professional", label: "Professional", emoji: "💼", desc: "Clean, trustworthy" },
  { value: "festive",      label: "Festive",       emoji: "🪔", desc: "Festival & celebration" },
  { value: "bold",         label: "Bold & Vibrant", emoji: "⚡", desc: "High-impact, eye-catching" },
  { value: "minimal",      label: "Minimal",        emoji: "◻", desc: "Simple, elegant" },
];

const GOALS = [
  { value: "leads",           label: "Get Leads" },
  { value: "calls",           label: "Phone Calls" },
  { value: "sales",           label: "Drive Sales" },
  { value: "bookings",        label: "Bookings" },
  { value: "brand_awareness", label: "Brand Awareness" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedCreative extends CreativeData {
  id: string;
  title: string;
  hindi_headline?: string;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CreativesPage() {
  const [platform, setPlatform] = useState("meta");
  const [format, setFormat] = useState("feed");
  const [style, setStyle] = useState("professional");
  const [goal, setGoal] = useState("leads");
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedCreative | null>(null);
  const [gallery, setGallery] = useState<GeneratedCreative[]>([]);

  const { data: bizData, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<{ data: Business[] }>("/api/v1/businesses"),
  });
  const businesses = bizData?.data ?? [];

  const availableFormats = FORMATS.filter((f) => f.platforms.includes(platform));

  async function generate() {
    if (!selectedBusinessId) { toast.error("Select a business first"); return; }
    setGenerating(true);
    setResult(null);
    try {
      const res = await apiClient.post<{ data: GeneratedCreative }>("/api/v1/creatives", {
        businessId: selectedBusinessId,
        platform,
        format,
        style,
        goal,
      });
      setResult(res.data);
      setGallery((prev) => [res.data, ...prev]);
      toast.success("Ad creative generated!");
    } catch (err: any) {
      toast.error(err?.message ?? "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Creative Generator
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI generates ad copy + real background image using DALL-E 3. Download as PNG.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Controls ── */}
        <div className="space-y-5">

          {/* Business */}
          <div>
            <label className="text-sm font-semibold block mb-2">Business</label>
            {bizLoading ? (
              <div className="h-10 rounded-lg border animate-pulse bg-muted" />
            ) : (
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                title="Select a business"
                aria-label="Select a business"
                className="w-full rounded-lg border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a business…</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.city ? `· ${b.city}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="text-sm font-semibold block mb-2">Campaign Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`rounded-lg border py-2 px-3 text-xs font-medium transition-colors text-left ${
                    goal === g.value ? "border-primary bg-primary/5 text-primary" : "hover:border-muted-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm font-semibold block mb-2">Platform</label>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { setPlatform(p.value); setFormat("feed"); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                    platform === p.value ? "border-primary bg-primary/5 text-primary" : "hover:border-muted-foreground"
                  }`}
                >
                  <span className={`h-6 w-6 rounded flex items-center justify-center text-xs font-black ${p.color}`}>
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-sm font-semibold block mb-2">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {availableFormats.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`rounded-lg border py-2.5 px-3 text-left transition-colors ${
                    format === f.value ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-semibold">{f.label}</p>
                  <p className="text-[11px] text-muted-foreground">{f.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-sm font-semibold block mb-2">Creative Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`rounded-lg border py-2.5 px-3 text-left flex items-center gap-2 transition-colors ${
                    style === s.value ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={generate}
            disabled={generating || !selectedBusinessId}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating ad creative…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Ad Creative (5 credits)
              </>
            )}
          </button>
          {generating && (
            <p className="text-xs text-center text-muted-foreground">
              AI is writing copy + generating background image with DALL-E 3. This takes ~20 seconds.
            </p>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div>
          {generating && (
            <div className="rounded-2xl border bg-muted/30 flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg">
                <Wand2 className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold">Generating your ad…</p>
                <p className="text-xs text-muted-foreground">Writing copy, then generating image with DALL-E 3</p>
              </div>
              <div className="flex flex-col gap-1.5 w-48 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-orange-500 shrink-0" />
                  Writing ad headlines & body copy
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-orange-500 shrink-0" />
                  Generating background image (DALL-E 3)
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  Compositing final ad preview
                </div>
              </div>
            </div>
          )}

          {!generating && result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{result.title}</h3>
                <button
                  type="button"
                  onClick={generate}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>

              <AdCreativePreview creative={result} />

              {/* Hindi variant */}
              {result.hindi_headline && (
                <div className="rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">🇮🇳 Hindi / Hinglish Version</p>
                  <p className="font-bold">{result.hindi_headline}</p>
                  {result.body_copy && <p className="text-xs text-muted-foreground mt-1">{result.body_copy}</p>}
                </div>
              )}
            </div>
          )}

          {!generating && !result && (
            <div className="rounded-2xl border border-dashed flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-20" />
              <div className="text-center">
                <p className="font-medium">Your ad will appear here</p>
                <p className="text-xs mt-1">Configure options on the left, then click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery ── */}
      {gallery.length > 1 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Generated This Session</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.slice(1).map((item) => (
              <div
                key={item.id}
                onClick={() => setResult(item)}
                className="cursor-pointer rounded-xl border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
              >
                <AdCreativePreview creative={item} compact />
                <div className="p-2 border-t">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.format} · {item.platform}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
