"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

interface BusinessesResponse { data: Business[] }

const SEVERITY_DOT: Record<string, string> = {
  easy:   "bg-green-500",
  medium: "bg-yellow-500",
  hard:   "bg-red-500",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5 space-y-3">
      <h3 className="font-semibold text-base">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ label, color = "bg-muted text-muted-foreground" }: { label: string; color?: string }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${color}`}>{label}</span>;
}

function AnalyzingSpinner({ domain }: { domain: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🕵️</span>
      </div>
      <div className="text-center">
        <p className="font-semibold">Analysing {domain}...</p>
        <p className="text-sm text-muted-foreground mt-1 animate-pulse">Gathering intelligence · Finding gaps · Building your advantage</p>
      </div>
      <p className="text-xs text-muted-foreground">Takes 20–30 seconds</p>
    </div>
  );
}

function ResultView({ result, onReset }: { result: any; onReset: () => void }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🕵️</span>
            <h2 className="text-xl font-bold">{result.competitor_name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{result.competitorUrl}</p>
          {result.estimated_ad_spend && (
            <p className="text-xs mt-1 text-orange-600 font-medium">Est. ad spend: {result.estimated_ad_spend}</p>
          )}
        </div>
        <button onClick={onReset} className="text-sm text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-muted shrink-0">
          New Analysis
        </button>
      </div>

      {/* Positioning summary */}
      {result.positioning && (
        <Section title="📊 Their Positioning">
          <p className="text-sm text-muted-foreground leading-relaxed">{result.positioning.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1.5">Their Strengths</p>
              <ul className="space-y-1">
                {(result.positioning.strengths ?? []).map((s: string, i: number) => (
                  <li key={i} className="text-xs flex gap-1.5"><span className="text-green-500 mt-0.5">●</span>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1.5">Their Weaknesses</p>
              <ul className="space-y-1">
                {(result.positioning.weaknesses ?? []).map((w: string, i: number) => (
                  <li key={i} className="text-xs flex gap-1.5"><span className="text-red-400 mt-0.5">●</span>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {result.positioning.target_audience && (
            <p className="text-xs text-muted-foreground mt-2">Target: {result.positioning.target_audience}</p>
          )}
        </Section>
      )}

      {/* SWOT */}
      {result.swot && (
        <Section title="⚔️ SWOT vs Your Business">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Strengths", key: "strengths", color: "border-green-200 bg-green-50" },
              { label: "Weaknesses", key: "weaknesses", color: "border-red-200 bg-red-50" },
              { label: "Opportunities for You", key: "opportunities", color: "border-blue-200 bg-blue-50" },
              { label: "Threats to Watch", key: "threats", color: "border-orange-200 bg-orange-50" },
            ].map(({ label, key, color }) => (
              <div key={key} className={`rounded-lg border p-3 ${color}`}>
                <p className="text-xs font-semibold mb-2">{label}</p>
                <ul className="space-y-1">
                  {((result.swot as any)[key] ?? []).map((item: string, i: number) => (
                    <li key={i} className="text-xs leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Ad angles */}
      {Array.isArray(result.ad_angles) && result.ad_angles.length > 0 && (
        <Section title="🎯 Ad Angles to Beat Them">
          <div className="space-y-3">
            {result.ad_angles.map((a: any, i: number) => (
              <div key={i} className="rounded-lg border p-3 space-y-1">
                <p className="text-xs font-semibold text-primary">{a.angle}</p>
                <p className="text-sm font-medium">"{a.headline}"</p>
                <p className="text-xs text-muted-foreground">{a.why_it_works}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Keyword opportunities */}
      {Array.isArray(result.keyword_opportunities) && result.keyword_opportunities.length > 0 && (
        <Section title="🔍 Keyword Opportunities">
          <div className="space-y-2">
            {result.keyword_opportunities.map((k: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[k.difficulty] ?? "bg-gray-400"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{k.keyword}</p>
                  <p className="text-xs text-muted-foreground">{k.opportunity}</p>
                </div>
                <Chip label={k.difficulty} color={k.difficulty === "easy" ? "bg-green-100 text-green-700" : k.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Market & content gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.isArray(result.market_gaps) && result.market_gaps.length > 0 && (
          <Section title="💡 Market Gaps">
            <ul className="space-y-2">
              {result.market_gaps.map((g: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-blue-500">→</span>{g}</li>
              ))}
            </ul>
          </Section>
        )}
        {Array.isArray(result.content_gaps) && result.content_gaps.length > 0 && (
          <Section title="✍️ Content to Create">
            <ul className="space-y-2">
              {result.content_gaps.map((g: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-purple-500">→</span>{g}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Action plan */}
      {Array.isArray(result.action_plan) && result.action_plan.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-800 mb-3">✅ Your Action Plan</h3>
          <ol className="space-y-2">
            {result.action_plan.map((a: string, i: number) => (
              <li key={i} className="text-sm text-green-800 flex gap-3">
                <span className="font-bold flex-shrink-0">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function CompetitorsPage() {
  const [url, setUrl] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: bizData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses?limit=20"),
  });
  const businesses = bizData?.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !businessId) return;
    setLoading(true);
    setResult(null);
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
      const res = await apiClient.post<{ data: any }>("/api/v1/competitors", { competitorUrl: targetUrl, businessId });
      setResult(res.data);
      toast.success("Competitor analysis complete!");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Analysis failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function extractDomain(u: string) {
    try { return new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace("www.", ""); }
    catch { return u; }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Analyse any competitor website. Get keyword gaps, ad angles, and your winning strategy.
        </p>
      </div>

      {loading && <AnalyzingSpinner domain={extractDomain(url)} />}

      {!loading && result && (
        <ResultView result={result} onReset={() => { setResult(null); setUrl(""); }} />
      )}

      {!loading && !result && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Your business</label>
              {businesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No businesses found. Create one first in Campaigns.</p>
              ) : (
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                >
                  <option value="">Select your business...</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Competitor website</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="competitorwebsite.com"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !businessId}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Analyse Competitor
          </button>
          <p className="text-xs text-muted-foreground">Costs 20 credits · 20–30 seconds · AI-powered intelligence</p>
        </form>
      )}
    </div>
  );
}
