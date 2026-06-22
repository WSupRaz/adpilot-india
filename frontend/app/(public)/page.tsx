import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold text-primary">AdPilot India</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Your AI Marketing Employee
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your business in Hindi, Hinglish, or English. Get professional
          Google &amp; Meta ad campaigns ready to run — in 90 seconds.
        </p>
        <p className="mt-2 text-lg text-muted-foreground italic">
          "Meri saree shop hai Bhopal mein. Budget ₹500/day hai."
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground"
          >
            Start Free Trial
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border px-8 py-3 text-base font-semibold"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features placeholder */}
      <section className="container py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "AI Campaign Builder", desc: "Google & Meta campaigns generated from plain language" },
          { title: "Marketing Audit", desc: "Full website audit with actionable fix recommendations" },
          { title: "WhatsApp AI Agent", desc: "Qualify leads and book appointments automatically" },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border p-6">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
