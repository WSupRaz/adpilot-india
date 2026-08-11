"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search, CheckCircle2, AlertCircle, Zap, Globe, BarChart2,
  Smartphone, Clock, MousePointerClick, Shield, Megaphone,
} from "lucide-react";
import { IssueList } from "./IssueList";
import { AuditPDFButton } from "./AuditPDFButton";
import { apiClient } from "@/lib/api-client";

const SCORE_CATEGORIES = [
  { key: "seo_score",         label: "SEO",          icon: Search,           color: "bg-blue-100 text-blue-600" },
  { key: "ux_score",          label: "UX",            icon: MousePointerClick, color: "bg-purple-100 text-purple-600" },
  { key: "mobile_score",      label: "Mobile",        icon: Smartphone,       color: "bg-green-100 text-green-600" },
  { key: "speed_score",       label: "Speed",         icon: Clock,            color: "bg-yellow-100 text-yellow-700" },
  { key: "conversion_score",  label: "Conversion",    icon: BarChart2,        color: "bg-orange-100 text-orange-600" },
  { key: "trust_score",       label: "Trust",         icon: Shield,           color: "bg-slate-100 text-slate-600" },
  { key: "ad_readiness_score", label: "Ad Readiness", icon: Megaphone,        color: "bg-red-100 text-red-600" },
];

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

function scoreColor(score: number) {
  return score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="44" y="49" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>{score}</text>
    </svg>
  );
}

function AnalyzingAnimation() {
  const steps = [
    "Fetching website content…",
    "Checking SEO signals…",
    "Analysing mobile experience…",
    "Measuring page speed…",
    "Evaluating trust signals…",
    "Checking ad readiness…",
    "Generating recommendations…",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border bg-card p-8 max-w-md mx-auto mt-4 text-center">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="font-semibold text-base">Analysing your website…</p>
      <p className="text-sm text-muted-foreground mt-1.5 animate-pulse min-h-5">{steps[step]}</p>
      <p className="text-xs text-muted-foreground mt-4">15–30 seconds · Please keep this tab open</p>
    </div>
  );
}

export function AuditScoreCard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setAudit(null);
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
      const result = await apiClient.post<{ data: any }>("/api/v1/audits", { url: targetUrl });
      setAudit(result.data);
      toast.success("Audit complete!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? err?.message ?? "Audit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <AnalyzingAnimation />;

  if (audit) {
    const sortedIssues = [...(audit.issues ?? [])].sort(
      (a: any, b: any) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
    const critCount = sortedIssues.filter((i: any) => i.severity === "critical").length;
    const highCount = sortedIssues.filter((i: any) => i.severity === "high").length;

    return (
      <div className="space-y-5 max-w-3xl">
        {/* Hero result card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <ScoreRing score={audit.overall_score ?? 0} />
              <div>
                <p className="text-xs opacity-60 font-medium uppercase tracking-wide mb-1">Website Audit</p>
                <p className="font-semibold text-lg">Overall Score</p>
                <p className="text-xs opacity-60 mt-0.5 max-w-xs truncate">{audit.url}</p>
                {critCount > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-red-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{critCount} critical issue{critCount > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setAudit(null); setUrl(""); }}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors"
              >
                New Audit
              </button>
              <AuditPDFButton auditId={audit.id} />
            </div>
          </div>
          {audit.summary && (
            <p className="text-sm opacity-75 mt-4 pt-4 border-t border-white/10 leading-relaxed">{audit.summary}</p>
          )}
        </div>

        {/* Issue count badges */}
        {(critCount > 0 || highCount > 0) && (
          <div className="flex gap-2">
            {critCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                {critCount} Critical
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                {highCount} High
              </div>
            )}
          </div>
        )}

        {/* Category scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCORE_CATEGORIES.map(({ key, label, icon: Icon, color }) => {
            const score = audit[key] ?? null;
            return (
              <div key={key} className="rounded-xl border bg-card p-4 text-center hover:shadow-sm transition-shadow">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {score !== null ? (
                  <p className={`text-xl font-bold ${scoreColor(score)}`}>{score}</p>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground">—</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick wins */}
        {Array.isArray(audit.quick_wins) && audit.quick_wins.length > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-green-200 text-green-700 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <p className="font-semibold text-sm text-green-800">Quick Wins — Fix These First</p>
            </div>
            <ul className="space-y-1.5">
              {audit.quick_wins.map((win: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues list */}
        <IssueList issues={sortedIssues} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-sm text-muted-foreground">
        Enter your website URL for a full AI audit covering SEO, UX, mobile readiness, speed, and ad readiness.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: Search, label: "SEO Analysis", color: "bg-blue-50 text-blue-600" },
          { icon: Smartphone, label: "Mobile Check", color: "bg-green-50 text-green-600" },
          { icon: Shield, label: "Trust Signals", color: "bg-slate-50 text-slate-600" },
          { icon: Megaphone, label: "Ad Readiness", color: "bg-red-50 text-red-500" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="yourwebsite.com"
              required
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Search className="h-4 w-4" />
          Run Website Audit
        </button>
        <p className="text-xs text-muted-foreground text-center">10 credits · AI-powered · 15–30 seconds</p>
      </form>
    </div>
  );
}
