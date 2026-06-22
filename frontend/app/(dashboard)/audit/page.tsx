import { Metadata } from "next";
import { AuditScoreCard } from "@/components/audit/AuditScoreCard";

export const metadata: Metadata = { title: "Marketing Audit" };

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketing Audit</h1>
        <p className="text-muted-foreground mt-1">
          Enter your website URL to get a full audit with fix recommendations.
        </p>
      </div>
      <AuditScoreCard />
    </div>
  );
}
