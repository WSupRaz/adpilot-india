import Link from "next/link";
import { PLANS } from "@/../../shared/src/constants/plans";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          No agency fees. No hidden costs. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 flex flex-col gap-4 ${
              plan.highlighted ? "border-primary shadow-lg" : ""
            }`}
          >
            <div>
              <h2 className="text-xl font-bold">{plan.displayName}</h2>
              <p className="text-3xl font-bold mt-2">
                ₹{(plan.priceMonthly / 100).toLocaleString("en-IN")}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>
            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
