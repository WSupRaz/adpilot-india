import { Metadata } from "next";

export const metadata: Metadata = { title: "AI Growth Manager" };

export default function GrowthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Growth Manager</h1>
        <p className="text-muted-foreground mt-1">
          Tell us your goal. We build the complete strategy to get you there.
        </p>
      </div>
      <div className="rounded-xl border p-6 space-y-4 max-w-xl">
        <label className="text-sm font-medium">What result do you want?</label>
        <input
          type="text"
          placeholder="e.g. I need 50 leads this month"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Build My Growth Plan
        </button>
      </div>
    </div>
  );
}
