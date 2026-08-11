"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TrendingUp, Target, Megaphone, Phone, ShoppingCart, DollarSign,
  CheckCircle2, ChevronDown, ChevronUp, Zap, Globe, MessageCircle,
  BarChart2, Calendar, ArrowRight, Lightbulb, Search,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

interface BusinessesResponse { data: Business[] }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card p-5 ${className}`}>{children}</div>;
}

const GOAL_TYPES = [
  { value: "leads",   label: "Get Leads",      icon: Target,       color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "sales",   label: "Drive Sales",    icon: ShoppingCart, color: "bg-green-50 text-green-600 border-green-200" },
  { value: "calls",   label: "Phone Calls",    icon: Phone,        color: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "revenue", label: "Grow Revenue",   icon: DollarSign,   color: "bg-orange-50 text-orange-600 border-orange-200" },
];

const TIMEFRAMES = [
  { value: 15, label: "15 days" },
  { value: 30, label: "1 month" },
  { value: 60, label: "2 months" },
  { value: 90, label: "3 months" },
];

const CHANNEL_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  "Meta Ads":       { icon: Megaphone, color: "text-blue-600",  bg: "bg-blue-100" },
  "Google Ads":     { icon: Search,    color: "text-red-600",   bg: "bg-red-100" },
  "WhatsApp":       { icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
  "SEO":            { icon: Globe,     color: "text-purple-600", bg: "bg-purple-100" },
  "Google Business":{ icon: BarChart2, color: "text-orange-600", bg: "bg-orange-100" },
  "Influencer":     { icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-100" },
  "Offline":        { icon: Target,    color: "text-gray-600",  bg: "bg-gray-100" },
};

function fallbackIcon(name: string) {
  return CHANNEL_ICONS[name] ?? { icon: Zap, color: "text-primary", bg: "bg-primary/10" };
}

// ── Loading ───────────────────────────────────────────────────────────────────
function GeneratingState() {
  const steps = ["Analysing your market…", "Planning channel strategy…", "Allocating your budget…", "Writing ad copy…", "Building your timeline…"];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <Card className="max-w-md mx-auto mt-8 text-center py-12">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="font-semibold text-base">Building your growth plan…</p>
      <p className="text-sm text-muted-foreground mt-1.5 animate-pulse min-h-5">{steps[step]}</p>
      <p className="text-xs text-muted-foreground mt-4">Takes 20–35 seconds</p>
    </Card>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
function FormView({ businesses, onSubmit }: {
  businesses: Business[];
  onSubmit: (form: any) => void;
}) {
  const [form, setForm] = useState({
    businessId: "", goalDescription: "", goalType: "leads",
    goalQuantity: "", goalTimeframe: 30, availableBudgetRs: "",
  });
  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="max-w-xl space-y-5">
      {/* Business */}
      <Card>
        <label className="text-sm font-semibold block mb-2">Your business</label>
        {businesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No businesses found — create one via Campaigns → New Campaign first.</p>
        ) : (
          <select
            value={form.businessId}
            onChange={e => set("businessId", e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select business…</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
          </select>
        )}
      </Card>

      {/* Goal */}
      <Card>
        <label className="text-sm font-semibold block mb-3">What do you want to achieve?</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {GOAL_TYPES.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("goalType", value)}
              className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm font-medium transition-all ${
                form.goalType === value ? color + " shadow-sm" : "hover:bg-muted/40 border-border"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <textarea
          value={form.goalDescription}
          onChange={e => set("goalDescription", e.target.value)}
          placeholder="Describe your goal in detail… e.g. 'I need 50 leads this month for my gym in Jaipur with a ₹15,000 budget'"
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground mt-1">Hindi or English is fine</p>
      </Card>

      {/* Numbers */}
      <Card>
        <label className="text-sm font-semibold block mb-3">Numbers (optional but improves accuracy)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Timeframe</label>
            <select
              value={form.goalTimeframe}
              onChange={e => set("goalTimeframe", Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Target quantity</label>
            <input
              type="number"
              value={form.goalQuantity}
              onChange={e => set("goalQuantity", e.target.value)}
              placeholder="e.g. 50"
              min={1}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground block mb-1">Monthly budget (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
              <input
                type="number"
                value={form.availableBudgetRs}
                onChange={e => set("availableBudgetRs", e.target.value)}
                placeholder="10000"
                min={1000}
                className="w-full rounded-lg border bg-background pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </Card>

      <button
        onClick={() => onSubmit(form)}
        disabled={!form.businessId || !form.goalDescription || form.goalDescription.length < 10}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <TrendingUp className="h-4 w-4" />
        Build My Growth Plan
      </button>
      <p className="text-xs text-muted-foreground text-center">20 credits · AI-powered strategy · 20–35 seconds</p>
    </div>
  );
}

// ── Result view ───────────────────────────────────────────────────────────────
type Tab = "overview" | "ads" | "creative" | "timeline";

function ResultView({ result, onReset }: { result: any; onReset: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview",  label: "Overview",     icon: BarChart2 },
    { key: "ads",       label: "Ad Strategy",  icon: Megaphone },
    { key: "creative",  label: "Creative",     icon: Zap },
    { key: "timeline",  label: "Week-by-week", icon: Calendar },
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">AI Growth Plan</p>
            <h2 className="text-xl font-bold leading-snug max-w-sm">{result.goalDescription}</h2>
            {result.summary && <p className="text-sm opacity-80 mt-2 leading-relaxed max-w-md">{result.summary}</p>}
          </div>
          <button onClick={onReset} className="shrink-0 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            New Plan
          </button>
        </div>

        {/* KPI pills */}
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-white/20">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{result.expected_leads ?? "—"}</p>
            <p className="text-xs opacity-70">Expected leads</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">₹{result.expected_cost_rs ? Number(result.expected_cost_rs).toLocaleString("en-IN") : "—"}</p>
            <p className="text-xs opacity-70">Total budget</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className={`text-xl font-bold capitalize`}>{result.confidence ?? "—"}</p>
            <p className="text-xs opacity-70">Confidence</p>
          </div>
        </div>
      </div>

      {/* Quick win */}
      {result.india_intelligence?.quick_win && (
        <Card className="border-amber-200 bg-amber-50 flex gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Zap className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Do This TODAY — Free</p>
            <p className="text-sm text-amber-900">{result.india_intelligence.quick_win}</p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Channels */}
          {Array.isArray(result.channels) && (
            <div className="space-y-3">
              {result.channels.map((ch: any, i: number) => {
                const fi = fallbackIcon(ch.name);
                const ChIcon = fi.icon;
                return (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${fi.bg}`}>
                          <ChIcon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${fi.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{ch.name}</p>
                          {ch.priority === "primary" && <span className="text-xs text-primary font-medium">Primary channel</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{Number(ch.budget_rs_monthly ?? 0).toLocaleString("en-IN")}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                        <p className="text-xs text-muted-foreground">{ch.allocation_percent}% of budget</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full bg-primary`} style={{ width: `${ch.allocation_percent}%`, transition: "width 0.8s ease" }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{ch.why}</p>
                    {ch.expected_result && <p className="text-xs text-green-700 font-medium mt-1">→ {ch.expected_result}</p>}
                  </Card>
                );
              })}
            </div>
          )}

          {/* KPIs */}
          {result.optimization?.kpis && (
            <Card>
              <p className="font-semibold text-sm mb-3">KPIs to Track</p>
              <ul className="space-y-2">
                {result.optimization.kpis.map((k: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{k}</li>
                ))}
              </ul>
              {result.optimization.kill_signal && (
                <div className="mt-3 pt-3 border-t flex gap-2 text-xs text-muted-foreground">
                  <span className="text-red-500 font-bold">Kill signal:</span>
                  {result.optimization.kill_signal}
                </div>
              )}
            </Card>
          )}

          {/* India intelligence */}
          {result.india_intelligence && (result.india_intelligence.festival_alert || result.india_intelligence.city_insight) && (
            <Card className="bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Lightbulb className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-sm">India Intelligence</span>
              </div>
              <div className="space-y-2 text-sm">
                {result.india_intelligence.festival_alert && (
                  <p><span className="font-medium">Festival:</span> <span className="text-muted-foreground">{result.india_intelligence.festival_alert}</span></p>
                )}
                {result.india_intelligence.city_insight && (
                  <p><span className="font-medium">City insight:</span> <span className="text-muted-foreground">{result.india_intelligence.city_insight}</span></p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "ads" && result.ad_strategy && (
        <div className="space-y-4">
          {result.ad_strategy.meta && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Megaphone className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
                <h3 className="font-semibold">Meta Ads (Facebook / Instagram)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Objective</p>
                  <p className="font-medium">{result.ad_strategy.meta.objective}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Creative type</p>
                  <p className="font-medium capitalize">{result.ad_strategy.meta.creative_type}</p>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Sample headline</p>
                <p className="text-sm font-semibold">"{result.ad_strategy.meta.sample_headline}"</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">CTA: </span>
                <span className="font-medium">{result.ad_strategy.meta.sample_cta}</span>
              </div>
              {result.ad_strategy.meta.audience && (
                <p className="text-xs text-muted-foreground mt-2">{result.ad_strategy.meta.audience}</p>
              )}
            </Card>
          )}

          {result.ad_strategy.google && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Search className="h-[18px] w-[18px]" />
                </div>
                <h3 className="font-semibold">Google Ads</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Campaign type</p>
                  <p className="font-medium">{result.ad_strategy.google.campaign_type}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Match type</p>
                  <p className="font-medium">{result.ad_strategy.google.match_type}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Target keywords</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(result.ad_strategy.google.top_keywords ?? []).map((k: string, i: number) => (
                  <span key={i} className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">{k}</span>
                ))}
              </div>
              {result.ad_strategy.google.negative_keywords?.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Negative keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.ad_strategy.google.negative_keywords.map((k: string, i: number) => (
                      <span key={i} className="rounded-full bg-red-50 text-red-600 text-xs px-2.5 py-1">−{k}</span>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}

          {result.followup_strategy && (
            <Card className="border-green-200 bg-green-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-green-200 text-green-700 flex items-center justify-center">
                  <MessageCircle className="h-[18px] w-[18px]" />
                </div>
                <h3 className="font-semibold text-green-800">WhatsApp Follow-up</h3>
              </div>
              <p className="text-sm text-green-800">{result.followup_strategy.whatsapp}</p>
              <p className="text-xs text-green-700 font-medium mt-2">Response target: {result.followup_strategy.response_time_target}</p>
              {result.followup_strategy.script && (
                <div className="mt-3 rounded-lg bg-white/60 border border-green-200 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Message template</p>
                  <p className="text-sm italic text-green-900">"{result.followup_strategy.script}"</p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === "creative" && result.creative_strategy && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Content Pillars</p>
              <div className="space-y-2">
                {(result.creative_strategy.content_pillars ?? []).map((p: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    {p}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Formats to Use</p>
              <div className="space-y-2">
                {(result.creative_strategy.formats ?? []).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Zap className="h-3.5 w-3.5 text-primary shrink-0" />{f}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Tone</p>
                <p className="text-sm font-medium mt-0.5">{result.creative_strategy.tone}</p>
              </div>
            </Card>
          </div>
          {Array.isArray(result.creative_strategy.hooks) && (
            <Card>
              <p className="font-semibold text-sm mb-3">Hook Lines — copy these into your ads</p>
              <div className="space-y-2">
                {result.creative_strategy.hooks.map((h: string, i: number) => (
                  <div key={i} className="flex gap-3 rounded-lg bg-muted/40 p-3">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-sm italic">"{h}"</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "timeline" && result.budget_breakdown?.weekly && (
        <div className="space-y-3">
          {result.budget_breakdown.weekly.map((w: any, i: number) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{w.week}</div>
                  <div>
                    <p className="font-semibold text-sm">Week {w.week}</p>
                    <p className="text-xs text-muted-foreground">{w.focus}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">₹{Number(w.spend_rs ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <ul className="space-y-1.5">
                {(w.actions ?? []).map((a: string, j: number) => (
                  <li key={j} className="flex gap-2 text-sm"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />{a}</li>
                ))}
              </ul>
            </Card>
          ))}
          {result.optimization?.week_2_review && (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-yellow-200 text-yellow-700 flex items-center justify-center shrink-0">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-yellow-700 mb-1 uppercase tracking-wide">Week 2 Optimisation Check</p>
                  <p className="text-sm text-yellow-900">{result.optimization.week_2_review}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GrowthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: bizData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses?limit=20"),
  });
  const businesses = bizData?.data ?? [];

  async function handleSubmit(form: any) {
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
      toast.success("Growth plan ready!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Growth Manager</h1>
        <p className="text-muted-foreground mt-1">
          Tell us your goal and budget. We'll build the complete marketing strategy to get you there.
        </p>
      </div>

      {loading && <GeneratingState />}
      {!loading && result && <ResultView result={result} onReset={() => setResult(null)} />}
      {!loading && !result && <FormView businesses={businesses} onSubmit={handleSubmit} />}
    </div>
  );
}
