import { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Revenue" };

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenue</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "MRR", value: "₹0" },
          { label: "ARR", value: "₹0" },
          { label: "Active Subs", value: "0" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="text-3xl font-bold mt-1">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
