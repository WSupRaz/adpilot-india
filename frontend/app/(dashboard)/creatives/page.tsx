import { Metadata } from "next";

export const metadata: Metadata = { title: "Creative Generator" };

export default function CreativesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creative Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate ad creatives, reel scripts, and video concepts.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          + New Creative
        </button>
      </div>
      <div className="rounded-lg border p-12 text-center text-muted-foreground">
        No creatives yet. Generate your first ad creative.
      </div>
    </div>
  );
}
