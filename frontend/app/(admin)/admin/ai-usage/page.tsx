import { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — AI Usage" };

export default function AdminAIUsagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Usage</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total AI Calls Today", value: "0" },
          { label: "Total Cost Today (USD)", value: "$0.00" },
          { label: "Avg Latency (ms)", value: "—" },
          { label: "Error Rate", value: "0%" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-bold mt-1">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
