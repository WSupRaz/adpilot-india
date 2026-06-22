"use client";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
  info: "bg-gray-100 text-gray-500",
};

interface Issue {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  impact_score: number;
}

interface IssueListProps {
  auditId: string;
}

export function IssueList({ auditId }: IssueListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Issues Found</h3>
      <p className="text-sm text-muted-foreground">
        Ordered by impact. Fix critical issues first.
      </p>
      {/* Populated via client-side fetch */}
      <div className="rounded-lg border divide-y">
        <div className="p-4 text-sm text-muted-foreground text-center">
          Loading issues...
        </div>
      </div>
    </div>
  );
}
