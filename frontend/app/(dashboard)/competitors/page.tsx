"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search, TrendingUp, Target, Lightbulb, Shield, ChevronDown, ChevronUp,
  Globe, AlertCircle, CheckCircle2, ArrowRight, BarChart2, Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

interface BusinessesResponse { data: Business[] }

// ── Small helpers ─────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card p-5 ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
  );
}

const DIFFICULTY_STYLE: Record<string, { badge: string; label: string }> = {
  easy:   { badge: "bg-green-100 text-green-700",  label: "Easy win" },
  medium: { badge: "bg-yellow-100 text-yellow-700", label: "Medium" },
  hard:   { badge: "bg-red-100 text-red-700",       label: "Competitive" },
};

// ── Loading state ─────────────────────────────────────────────────────────────
function AnalyzingState({ domain }: { domain: string }) {
  const steps = ["Fetching competitor website…", "Identifying their positioning…", "Finding your keyword gaps…", "Building your attack strategy…"];
  const [step, setStep] = useState(0);
  useState(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 3000);
    return () => clearInterval(id);
  });
  return (
    <Card className="max-w-md mx-auto mt-8 text-center py-12">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="font-semibold text-base">Analysing {domain}</p>
      <p className="text-sm text-muted-foreground mt-1.5 animate-pulse min-h-5">{steps[step]}</p>
      <p className="text-xs text-muted-foreground mt-4">Takes 20–30 seconds</p>
    </Card>
  );
}

// ── Form / empty state ────────────────────────────────────────────────────────
const FEATURE_PREVIEW = [
  { icon: BarChart2,  label: "SWOT Analysis",       desc: "Strengths, weaknesses and opportunities",  color: "bg-blue-50 text-blue-600" },
  { icon: Search,     label: "Keyword Gaps",         desc: "Keywords they rank for that you can steal", color: "bg-purple-50 text-purple-600" },
  { icon: Target,     label: "Ad Angles",            desc: "Headlines proven to beat their messaging",   color: "bg-orange-50 text-orange-600" },
  { icon: Lightbulb,  label: "Market Gaps",          desc: "Audiences and services they miss",           color: "bg-green-50 text-green-600" },
];

function FormState({ businesses, loading, onSubmit }: {
  businesses: Business[];
  loading: boolean;
  onSubmit: (url: string, businessId: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [businessId, setBusinessId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !businessId) return;
    onSubmit(url, businessId);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Feature preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FEATURE_PREVIEW.map(({ icon: Icon, label, desc, color }) => (
          <Card key={label} className="text-center py-4 hover:shadow-sm transition-shadow">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </div>
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</p>
          </Card>
        ))}
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Your business</label>
            {businesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No businesses found. Create one first via Campaigns → New Campaign.</p>
            ) : (
              <select
                value={businessId}
                onChange={e => setBusinessId(e.target.value)}
                required
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select your business…</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Competitor website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="competitorwebsite.com"
                required
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !businessId || !url}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Search className="h-4 w-4" />
            Analyse Competitor
          </button>
          <p className="text-xs text-muted-foreground text-center">20 credits · AI-powered · 20–30 seconds</p>
        </form>
      </Card>
    </div>
  );
}

// ── Results view ──────────────────────────────────────────────────────────────
function SwotCell({ label, items, colorClass }: { label: string; items: string[]; colorClass: string }) {
  return (
    <div className={`rounded-xl p-4 border ${colorClass}`}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-snug flex gap-1.5">
            <span className="mt-0.5 shrink-0">•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CollapsibleCard({ title, icon: Icon, iconColor, defaultOpen = false, children }: {
  title: string; icon: any; iconColor: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t">{children}</div>}
    </Card>
  );
}

function ResultView({ result, onReset }: { result: any; onReset: () => void }) {
  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 opacity-60" />
              <p className="text-xs font-medium opacity-60">COMPETITOR INTELLIGENCE</p>
            </div>
            <h2 className="text-xl font-bold">{result.competitor_name}</h2>
            <p className="text-sm opacity-60 mt-0.5">{result.competitorUrl}</p>
            {result.estimated_ad_spend && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-medium">Est. ad spend: {result.estimated_ad_spend}</span>
              </div>
            )}
          </div>
          <button onClick={onReset} className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors">
            New Analysis
          </button>
        </div>
        {result.positioning?.summary && (
          <p className="mt-4 text-sm opacity-80 leading-relaxed border-t border-white/10 pt-4">{result.positioning.summary}</p>
        )}
      </div>

      {/* Positioning strengths / weaknesses */}
      {result.positioning && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionTitle icon={CheckCircle2} title="Their Strengths" color="bg-green-100 text-green-700" />
            <ul className="space-y-2">
              {(result.positioning.strengths ?? []).map((s: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{s}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle icon={AlertCircle} title="Their Weaknesses" color="bg-red-100 text-red-600" />
            <ul className="space-y-2">
              {(result.positioning.weaknesses ?? []).map((w: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm"><AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />{w}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* SWOT */}
      {result.swot && (
        <CollapsibleCard title="SWOT Analysis" icon={BarChart2} iconColor="bg-blue-100 text-blue-600" defaultOpen>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <SwotCell label="Strengths" items={result.swot.strengths ?? []} colorClass="border-green-200 bg-green-50 text-green-900" />
            <SwotCell label="Weaknesses" items={result.swot.weaknesses ?? []} colorClass="border-red-200 bg-red-50 text-red-900" />
            <SwotCell label="Your Opportunities" items={result.swot.opportunities ?? []} colorClass="border-blue-200 bg-blue-50 text-blue-900" />
            <SwotCell label="Threats to Watch" items={result.swot.threats ?? []} colorClass="border-orange-200 bg-orange-50 text-orange-900" />
          </div>
        </CollapsibleCard>
      )}

      {/* Ad angles */}
      {Array.isArray(result.ad_angles) && result.ad_angles.length > 0 && (
        <CollapsibleCard title="Ad Angles to Beat Them" icon={Target} iconColor="bg-orange-100 text-orange-600" defaultOpen>
          <div className="space-y-3 mt-4">
            {result.ad_angles.map((a: any, i: number) => (
              <div key={i} className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">{a.angle}</p>
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">Angle {i + 1}</span>
                </div>
                <p className="text-sm font-semibold mt-2 leading-snug">"{a.headline}"</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{a.why_it_works}</p>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Keyword opportunities */}
      {Array.isArray(result.keyword_opportunities) && result.keyword_opportunities.length > 0 && (
        <CollapsibleCard title="Keyword Opportunities" icon={Search} iconColor="bg-purple-100 text-purple-600" defaultOpen>
          <div className="space-y-2 mt-4">
            {result.keyword_opportunities.map((k: any, i: number) => {
              const d = DIFFICULTY_STYLE[k.difficulty] ?? DIFFICULTY_STYLE.medium;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{k.keyword}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{k.opportunity}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium rounded-full px-2.5 py-1 ${d.badge}`}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleCard>
      )}

      {/* Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.isArray(result.market_gaps) && result.market_gaps.length > 0 && (
          <Card>
            <SectionTitle icon={Lightbulb} title="Market Gaps to Exploit" color="bg-yellow-100 text-yellow-700" />
            <ul className="space-y-2">
              {result.market_gaps.map((g: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm"><ArrowRight className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />{g}</li>
              ))}
            </ul>
          </Card>
        )}
        {Array.isArray(result.content_gaps) && result.content_gaps.length > 0 && (
          <Card>
            <SectionTitle icon={Zap} title="Content to Create" color="bg-violet-100 text-violet-600" />
            <ul className="space-y-2">
              {result.content_gaps.map((g: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm"><ArrowRight className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />{g}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Action plan */}
      {Array.isArray(result.action_plan) && result.action_plan.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <SectionTitle icon={CheckCircle2} title="Your Action Plan" color="bg-green-100 text-green-700" />
          <ol className="space-y-3">
            {result.action_plan.map((a: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-green-900">
                <span className="h-5 w-5 rounded-full bg-green-200 text-green-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pendingDomain, setPendingDomain] = useState("");

  const { data: bizData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses?limit=20"),
  });
  const businesses = bizData?.data ?? [];

  async function handleSubmit(url: string, businessId: string) {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
    try {
      const domain = new URL(targetUrl).hostname.replace("www.", "");
      setPendingDomain(domain);
    } catch { setPendingDomain(url); }

    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient.post<{ data: any }>("/api/v1/competitors", { competitorUrl: targetUrl, businessId });
      setResult(res.data);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Analyse any competitor's website. Get keyword gaps, ad angles, SWOT, and your winning strategy.
        </p>
      </div>

      {loading && <AnalyzingState domain={pendingDomain} />}
      {!loading && result && <ResultView result={result} onReset={() => setResult(null)} />}
      {!loading && !result && <FormState businesses={businesses} loading={loading} onSubmit={handleSubmit} />}
    </div>
  );
}
