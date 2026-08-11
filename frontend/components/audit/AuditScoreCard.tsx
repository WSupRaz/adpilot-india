"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IssueList } from "./IssueList";
import { AuditPDFButton } from "./AuditPDFButton";
import { apiClient } from "@/lib/api-client";

const SCORE_CATEGORIES = [
  { key: "seo_score", label: "SEO", icon: "🔍" },
  { key: "ux_score", label: "UX", icon: "✨" },
  { key: "mobile_score", label: "Mobile", icon: "📱" },
  { key: "speed_score", label: "Speed", icon: "⚡" },
  { key: "conversion_score", label: "Conversion", icon: "🎯" },
  { key: "trust_score", label: "Trust", icon: "🔒" },
  { key: "ad_readiness_score", label: "Ad Readiness", icon: "📣" },
];

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  return <span className={`font-bold text-xl ${color}`}>{score}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="44" y="49" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function AnalyzingAnimation() {
  const steps = [
    "Fetching website content...",
    "Checking SEO signals...",
    "Analysing mobile experience...",
    "Measuring page speed...",
    "Evaluating trust signals...",
    "Checking ad readiness...",
    "Generating AI recommendations...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🔍</span>
      </div>
      <div className="text-center space-y-2">
        <p className="font-semibold text-lg">Analysing your website...</p>
        <p className="text-sm text-muted-foreground animate-pulse min-h-[1.25rem]">
          {steps[step]}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">This takes 15–30 seconds · Please don't close this tab</p>
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
      const msg = err?.response?.data?.error?.message ?? err?.message ?? "Audit failed";
      toast.error(msg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <AnalyzingAnimation />;

  if (audit) {
    const sortedIssues = [...(audit.issues ?? [])].sort(
      (a: any, b: any) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
    const critCount = sortedIssues.filter((i: any) => i.severity === "critical").length;
    const highCount = sortedIssues.filter((i: any) => i.severity === "high").length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <ScoreRing score={audit.overall_score ?? 0} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">{audit.url}</p>
              <p className="text-2xl font-bold">Overall Score</p>
              {critCount > 0 && (
                <p className="text-sm text-red-600 font-medium mt-1">
                  {critCount} critical issue{critCount > 1 ? "s" : ""} found
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setAudit(null); setUrl(""); }}
              className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              New Audit
            </button>
            <AuditPDFButton auditId={audit.id} />
          </div>
        </div>

        {/* Summary */}
        {audit.summary && (
          <div className="rounded-lg bg-muted/50 border p-4 text-sm text-muted-foreground leading-relaxed">
            {audit.summary}
          </div>
        )}

        {/* Issue counts */}
        {(critCount > 0 || highCount > 0) && (
          <div className="flex gap-3">
            {critCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
                🔴 {critCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                🟠 {highCount} High
              </span>
            )}
          </div>
        )}

        {/* Score grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCORE_CATEGORIES.map(({ key, label, icon }) => (
            <div key={key} className="rounded-lg border p-3 text-center">
              <p className="text-lg mb-1">{icon}</p>
              <ScoreBadge score={audit[key] ?? null} />
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick wins */}
        {Array.isArray(audit.quick_wins) && audit.quick_wins.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-sm text-green-800 mb-2">⚡ Quick Wins (fix these first)</p>
            <ul className="space-y-1">
              {audit.quick_wins.map((win: string, i: number) => (
                <li key={i} className="text-sm text-green-700 flex gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues */}
        <IssueList issues={sortedIssues} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-muted-foreground">
        Enter your business website URL to get a full SEO, UX, and ad-readiness audit powered by AI.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourwebsite.com"
            required
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70 whitespace-nowrap"
          >
            Run Audit
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Consumes 10 credits · Takes 15–30 seconds · AI-powered analysis
        </p>
      </form>
    </div>
  );
}
