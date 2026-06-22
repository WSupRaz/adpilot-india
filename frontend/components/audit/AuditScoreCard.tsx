"use client";

import { useState } from "react";
import { toast } from "sonner";
import { JobProgress } from "@/components/shared/JobProgress";
import { IssueList } from "./IssueList";
import { AuditPDFButton } from "./AuditPDFButton";
import { apiClient } from "@/lib/api-client";

const SCORE_CATEGORIES = [
  { key: "seo_score", label: "SEO" },
  { key: "ux_score", label: "UX" },
  { key: "mobile_score", label: "Mobile" },
  { key: "speed_score", label: "Speed" },
  { key: "conversion_score", label: "Conversion" },
  { key: "trust_score", label: "Trust" },
  { key: "ad_readiness_score", label: "Ad Readiness" },
];

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  return <span className={`font-bold text-lg ${color}`}>{score}</span>;
}

export function AuditScoreCard() {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const result = await apiClient.post<{ data: { job_id: string } }>(
        "/api/v1/audits",
        { url }
      );
      setJobId(result.data.job_id);
    } catch {
      toast.error("Failed to start audit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onJobComplete(id: string) {
    setJobId(null);
    setAuditId(id);
    // Fetch audit results
    apiClient.get<{ data: any }>(`/api/v1/audits/${id}`).then((r) => setAudit(r.data));
  }

  if (jobId) {
    return (
      <JobProgress
        jobId={jobId}
        title="Auditing your website..."
        description="Checking SEO, UX, mobile, speed, conversion signals, and ad readiness."
        onComplete={onJobComplete}
      />
    );
  }

  if (audit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{audit.url}</p>
            <p className="text-4xl font-bold mt-1">{audit.overall_score}<span className="text-lg text-muted-foreground">/100</span></p>
          </div>
          <AuditPDFButton auditId={audit.id} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {SCORE_CATEGORIES.map(({ key, label }) => (
            <div key={key} className="rounded-lg border p-3 text-center">
              <ScoreBadge score={audit[key]} />
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <IssueList auditId={audit.id} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          required
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          {loading ? "Starting..." : "Run Audit"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Consumes 10 credits · Takes 30–60 seconds
      </p>
    </form>
  );
}
