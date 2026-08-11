"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

interface BusinessesResponse { data: Business[] }

const GOAL_TYPES = [
  { value: "leads",    label: "Get Leads",       emoji: "📋" },
  { value: "sales",    label: "Drive Sales",      emoji: "🛒" },
  { value: "calls",    label: "Get Phone Calls",  emoji: "📞" },
  { value: "revenue",  label: "Grow Revenue",     emoji: "💰" },
];

const TIMEFRAMES = [
  { value: 15,  label: "15 days" },
  { value: 30,  label: "1 month" },
  { value: 60,  label: "2 months" },
  { value: 90,  label: "3 months" },
];

function GeneratingSpinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">📈</span>
      </div>
      <div className="text-center">
        <p className="font-semibold">Building your growth plan...</p>
        <p className="text-sm text-muted-foreground mt-1 animate-pulse">Analysing your market · Allocating budget · Planning campaigns</p>
      </div>
      <p className="text-xs text-muted-foreground">Takes 20–35 seconds</p>
    </div>
  );
}

function ChannelBar({ name, percent, budgetRs, priority, why, expected }: {
  name: string; percent: number; budgetRs: number; priority: string; why: string; expected: string;
}) {
  const colors: Record<string, string> = {
    "Meta Ads":      "bg-blue-500",
    "Google Ads":    "bg-yellow-500",
    "WhatsApp":      "bg-green-500",
    "SEO":           "bg-purple-500",
    "Google Business": "bg-orange-400",
    "Influencer":    "bg-pink-500",
    "Offline":       "bg-gray-400",
  };
  const bar = colors[name] ?? "bg-primary";
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${bar}`} />
          <span className="font-medium text-sm">{name}</span>
          {priority === "primary" && (
            <span className="rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">Primary</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">₹{budgetRs.toLocaleString("en-IN")}/mo</span>
          <button onClick={() => setOpen(!open)} className="text-xs text-muted-foreground">
            {open ? "▲" : "▼"}
          </button>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${percent}%`, transition: "width 0.8s ease" }} />
      </div>
      <p className="text-xs text-muted-foreground">{percent}% allocation</p>
      {open && (
        <div className="pt-2 space-y-1.5 border-t">
          <p className="text-xs text-foreground/80">{why}</p>
          <p className="text-xs font-medium text-green-700">Expected: {expected}</p>
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onReset }: { result: any; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "creative" | "weekly">("overview");

  const tabs = [
    { key: "overview",  label: "Overview" },
    { key: "ads",       label: "Ad Strategy" },
    { key: "creative",  label: "Creative" },
    { key: "weekly",    label: "Week-by-week" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">📈 Growth Plan Ready</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{result.goalDescription}</p>
          {result.summary && <p className="text-sm mt-2 leading-relaxed max-w-xl">{result.summary}</p>}
        </div>
        <button onClick={onReset} className="text-sm text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-muted shrink-0">
          New Plan
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{result.expected_leads ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Expected leads</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">₹{result.expected_cost_rs ? Number(result.expected_cost_rs).toLocaleString("en-IN") : "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Total budget</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className={`text-2xl font-bold ${result.confidence === "high" ? "text-green-600" : result.confidence === "low" ? "text-red-500" : "text-yellow-600"}`}>
            {result.confidence ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Confidence</p>
        </div>
      </div>

      {/* India intelligence quick win */}
      {result.india_intelligence?.quick_win && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-semibold text-orange-700 mb-1">⚡ Do This TODAY (Free)</p>
          <p className="text-sm text-orange-800">{result.india_intelligence.quick_win}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Channel Allocation</h3>
          {Array.isArray(result.channels) && result.channels.map((c: any, i: number) => (
            <ChannelBar
              key={i}
              name={c.name}
              percent={c.allocation_percent}
              budgetRs={c.budget_rs_monthly}
              priority={c.priority}
              why={c.why}
              expected={c.expected_result}
            />
          ))}

          {result.optimization?.kpis && (
            <div className="rounded-lg border p-4">
              <p className="font-semibold text-sm mb-3">KPIs to Track</p>
              <ul className="space-y-1.5">
                {result.optimization.kpis.map((k: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-primary">✓</span>{k}</li>
                ))}
              </ul>
              {result.optimization.kill_signal && (
                <p className="text-xs text-muted-foreground mt-3 border-t pt-3">🚨 Kill signal: {result.optimization.kill_signal}</p>
              )}
            </div>
          )}

          {result.india_intelligence && (
            <div className="rounded-lg bg-muted/40 border p-4 space-y-2">
              <p className="font-semibold text-sm">🇮🇳 India Intelligence</p>
              {result.india_intelligence.festival_alert && (
                <p className="text-sm"><span className="font-medium">Festival:</span> {result.india_intelligence.festival_alert}</p>
              )}
              {result.india_intelligence.city_insight && (
                <p className="text-sm"><span className="font-medium">City insight:</span> {result.india_intelligence.city_insight}</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "ads" && result.ad_strategy && (
        <div className="space-y-4">
          {result.ad_strategy.meta && (
            <div className="rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">📘 Meta Ads (Facebook / Instagram)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Objective</p><p className="font-medium">{result.ad_strategy.meta.objective}</p></div>
                <div><p className="text-xs text-muted-foreground">Creative Type</p><p className="font-medium">{result.ad_strategy.meta.creative_type}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sample Headline</p>
                <p className="text-sm font-medium bg-muted rounded-md px-3 py-2">"{result.ad_strategy.meta.sample_headline}"</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">CTA</p>
                <p className="text-sm">{result.ad_strategy.meta.sample_cta}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Audience</p>
                <p className="text-sm">{result.ad_strategy.meta.audience}</p>
              </div>
            </div>
          )}

          {result.ad_strategy.google && (
            <div className="rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">🔍 Google Ads</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Campaign Type</p><p className="font-medium">{result.ad_strategy.google.campaign_type}</p></div>
                <div><p className="text-xs text-muted-foreground">Match Type</p><p className="font-medium">{result.ad_strategy.google.match_type}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Target Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.ad_strategy.google.top_keywords ?? []).map((k: string, i: number) => (
                    <span key={i} className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">{k}</span>
                  ))}
                </div>
              </div>
              {result.ad_strategy.google.negative_keywords && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Negative Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.ad_strategy.google.negative_keywords.map((k: string, i: number) => (
                      <span key={i} className="rounded-full bg-red-50 text-red-600 text-xs px-2.5 py-1">−{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.followup_strategy && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
              <h3 className="font-semibold text-green-800">💬 WhatsApp Follow-up</h3>
              <p className="text-sm text-green-700">{result.followup_strategy.whatsapp}</p>
              <p className="text-xs text-green-600">Response target: {result.followup_strategy.response_time_target}</p>
              {result.followup_strategy.script && (
                <div className="mt-2 rounded-lg bg-white border border-green-200 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Message template:</p>
                  <p className="text-sm italic">"{result.followup_strategy.script}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "creative" && result.creative_strategy && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Content Pillars</p>
              <div className="flex flex-wrap gap-2">
                {(result.creative_strategy.content_pillars ?? []).map((p: string, i: number) => (
                  <span key={i} className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Formats to Use</p>
              <div className="flex flex-wrap gap-2">
                {(result.creative_strategy.formats ?? []).map((f: string, i: number) => (
                  <span key={i} className="rounded-full bg-muted text-xs px-3 py-1">{f}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tone</p>
              <p className="text-sm font-medium">{result.creative_strategy.tone}</p>
            </div>
          </div>
          {Array.isArray(result.creative_strategy.hooks) && (
            <div className="rounded-xl border p-4 space-y-2">
              <p className="font-semibold text-sm">Hook Lines (copy these for your ads)</p>
              {result.creative_strategy.hooks.map((h: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/40">
                  <span className="text-primary font-bold text-sm flex-shrink-0">{i + 1}.</span>
                  <p className="text-sm italic">"{h}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "weekly" && result.budget_breakdown?.weekly && (
        <div className="space-y-3">
          {result.budget_breakdown.weekly.map((w: any, i: number) => (
            <div key={i} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Week {w.week}</p>
                <span className="text-sm font-medium text-muted-foreground">₹{Number(w.spend_rs).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{w.focus}</p>
              <ul className="space-y-1 mt-2">
                {(w.actions ?? []).map((a: string, j: number) => (
                  <li key={j} className="text-sm flex gap-2"><span className="text-primary">✓</span>{a}</li>
                ))}
              </ul>
            </div>
          ))}
          {result.optimization?.week_2_review && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Week 2 Optimisation Check</p>
              <p className="text-sm text-yellow-800">{result.optimization.week_2_review}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrowthPage() {
  const [form, setForm] = useState({ businessId: "", goalDescription: "", goalType: "leads", goalQuantity: "", goalTimeframe: 30, availableBudgetRs: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: bizData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses?limit=20"),
  });
  const businesses = bizData?.data ?? [];

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessId || !form.goalDescription) return;
    setLoading(true);
    setResult(null);
    try {
      const body: any = {
        businessId: form.businessId,
        goalDescription: form.goalDescription,
        goalType: form.goalType,
        goalTimeframe: form.goalTimeframe,
      };
      if (form.goalQuantity) body.goalQuantity = Number(form.goalQuantity);
      if (form.availableBudgetRs) body.availableBudgetPaise = Number(form.availableBudgetRs) * 100;

      const res = await apiClient.post<{ data: any }>("/api/v1/growth", body);
      setResult({ ...res.data, goalDescription: form.goalDescription });
      toast.success("Growth plan generated!");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Failed to generate plan. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Growth Manager</h1>
        <p className="text-muted-foreground mt-1">
          Tell us your goal and budget. We build the complete marketing strategy to get you there.
        </p>
      </div>

      {loading && <GeneratingSpinner />}

      {!loading && result && (
        <ResultView result={result} onReset={() => { setResult(null); setForm((f) => ({ ...f, goalDescription: "" })); }} />
      )}

      {!loading && !result && (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {/* Business */}
          <div>
            <label className="text-sm font-medium block mb-1.5">Your business *</label>
            {businesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No businesses found. Create one first in Campaigns.</p>
            ) : (
              <select
                value={form.businessId}
                onChange={(e) => set("businessId", e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              >
                <option value="">Select business...</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                ))}
              </select>
            )}
          </div>

          {/* Goal description */}
          <div>
            <label className="text-sm font-medium block mb-1.5">What result do you want? *</label>
            <input
              type="text"
              value={form.goalDescription}
              onChange={(e) => set("goalDescription", e.target.value)}
              placeholder="e.g. I need 50 leads this month for my gym in Jaipur"
              required
              minLength={10}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Hindi or English is fine</p>
          </div>

          {/* Goal type */}
          <div>
            <label className="text-sm font-medium block mb-2">Goal type</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => set("goalType", g.value)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    form.goalType === g.value ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  <span>{g.emoji}</span> {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe + quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Timeframe</label>
              <select
                value={form.goalTimeframe}
                onChange={(e) => set("goalTimeframe", Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              >
                {TIMEFRAMES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Target quantity <span className="text-muted-foreground">(optional)</span></label>
              <input
                type="number"
                value={form.goalQuantity}
                onChange={(e) => set("goalQuantity", e.target.value)}
                placeholder="e.g. 50"
                min={1}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm font-medium block mb-1.5">Available budget <span className="text-muted-foreground">(₹/month, optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                value={form.availableBudgetRs}
                onChange={(e) => set("availableBudgetRs", e.target.value)}
                placeholder="10000"
                min={1000}
                className="w-full rounded-md border px-3 py-2 pl-7 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.businessId}
            className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Build My Growth Plan
          </button>
          <p className="text-xs text-muted-foreground text-center">Costs 20 credits · 20–35 seconds · AI-powered strategy</p>
        </form>
      )}
    </div>
  );
}
