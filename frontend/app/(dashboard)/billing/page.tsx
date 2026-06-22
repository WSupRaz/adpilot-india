import { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Billing</h1>

      {/* Current plan */}
      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">Starter</p>
            <p className="text-sm text-muted-foreground">₹999/month · Renews Jul 19, 2026</p>
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Upgrade Plan
          </button>
        </div>
      </section>

      {/* Credits */}
      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="font-semibold">Credits</h2>
        <div className="flex items-center justify-between text-sm">
          <span>Used this month</span>
          <span className="font-medium">12 / 50</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: "24%" }} />
        </div>
        <button className="text-xs text-primary hover:underline">Buy more credits</button>
      </section>

      {/* Invoice history */}
      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="font-semibold">Invoice History</h2>
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      </section>
    </div>
  );
}
