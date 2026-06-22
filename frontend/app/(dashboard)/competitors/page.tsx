import { Metadata } from "next";

export const metadata: Metadata = { title: "Competitor Intelligence" };

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Analyse competitor ads, keywords, and positioning gaps.
        </p>
      </div>
      <div className="rounded-lg border p-6 space-y-4">
        <input
          type="url"
          placeholder="Enter competitor website URL..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Analyse Competitor
        </button>
      </div>
    </div>
  );
}
