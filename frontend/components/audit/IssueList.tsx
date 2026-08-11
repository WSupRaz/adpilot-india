"use client";

import { useState } from "react";

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical: { badge: "bg-red-100 text-red-700",    dot: "bg-red-500" },
  high:     { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  medium:   { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  low:      { badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-400" },
  info:     { badge: "bg-gray-100 text-gray-500",   dot: "bg-gray-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  seo:          "SEO",
  ux:           "UX",
  mobile:       "Mobile",
  speed:        "Speed",
  conversion:   "Conversion",
  trust:        "Trust",
  ad_readiness: "Ad Readiness",
};

interface Issue {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  impact_score?: number;
  effort_score?: number;
}

interface IssueListProps {
  issues: Issue[];
}

export function IssueList({ issues }: IssueListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  if (!issues || issues.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        No issues found — your website looks great!
      </div>
    );
  }

  const filters = ["all", "critical", "high", "medium", "low"];
  const visible = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  const countFor = (s: string) => issues.filter((i) => i.severity === s).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Issues Found <span className="text-muted-foreground font-normal text-sm">({issues.length})</span>
        </h3>
      </div>

      {/* Severity filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((s) => {
          const count = s === "all" ? issues.length : countFor(s);
          if (count === 0 && s !== "all") return null;
          const style = s !== "all" ? SEVERITY_STYLES[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                filter === s
                  ? style
                    ? `${style.badge} border-transparent`
                    : "bg-foreground text-background border-transparent"
                  : "bg-background border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Issue cards */}
      <div className="rounded-lg border divide-y overflow-hidden">
        {visible.map((issue) => {
          const style = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.info;
          const isOpen = expanded === issue.id;

          return (
            <div key={issue.id} className="bg-background">
              <button
                onClick={() => setExpanded(isOpen ? null : issue.id)}
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              >
                <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
                      {issue.severity}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">
                      {CATEGORY_LABELS[issue.category] ?? issue.category}
                    </span>
                    {issue.impact_score !== undefined && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        Impact {issue.impact_score}/10
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{issue.title}</p>
                </div>
                <span className="text-muted-foreground text-xs flex-shrink-0 mt-0.5">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 ml-5 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      What's the issue
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{issue.description}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                      ✅ How to fix
                    </p>
                    <p className="text-sm text-green-800 leading-relaxed">{issue.recommendation}</p>
                  </div>
                  {issue.effort_score !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Effort to fix: {issue.effort_score}/10
                      {issue.effort_score <= 3 ? " (quick fix)" : issue.effort_score <= 6 ? " (moderate)" : " (significant work)"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
