import Link from "next/link";
import {
  Megaphone, Paintbrush, Search, Users, MessageCircle, TrendingUp,
  Zap, CheckCircle2, ArrowRight, ChevronRight, MessageSquare,
  Sparkles, Rocket,
} from "lucide-react";

export const metadata = { title: "AdPilot India — AI Marketing for Indian SMBs" };

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-[#080810] text-white overflow-x-hidden">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee { animation: marquee 32s linear infinite; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.65s ease both; }
        .fade-up-2 { animation: fadeUp 0.65s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.65s 0.24s ease both; }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080810]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black text-white shrink-0">A</div>
            <span className="text-[15px] font-bold">AdPilot <span className="text-orange-400">India</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[["Features", "#features"], ["How it works", "#how"], ["Pricing", "/pricing"]].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-white/55 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/55 hover:text-white transition-colors">Login</Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 hover:shadow-orange-500/35 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center pt-16">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[560px] h-[560px] bg-orange-500/12 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-amber-400/7 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center">

            {/* Left: content */}
            <div>
              {/* Badge */}
              <div className="fade-up inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-3.5 py-1.5 text-xs font-medium text-orange-300 mb-7">
                <Zap className="h-3 w-3 shrink-0" />
                Built exclusively for Indian SMBs
              </div>

              {/* Headline */}
              <h1 className="fade-up-2 text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.04] mb-4">
                Your AI<br />Marketing<br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Employee.
                </span>
              </h1>

              <p className="fade-up-3 text-lg md:text-xl text-white/45 font-medium mb-5 leading-snug">
                Works 24/7. Never asks for a raise.
              </p>

              <p className="fade-up-3 text-base text-white/45 max-w-[440px] leading-relaxed mb-9">
                Describe your business in Hindi or English. Get complete Google and Meta campaigns in 90 seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:opacity-95 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-xs text-white/25">No credit card required · 50 free credits on signup</p>
            </div>

            {/* Right: demo card */}
            <div className="relative mt-8 lg:mt-0">
              {/* Main demo card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <span className="text-xs text-white/35 font-medium">Customer prompt</span>
                </div>

                <p className="text-sm text-white/65 leading-relaxed italic mb-5 border-b border-white/6 pb-5">
                  "Meri saree shop hai Bhopal mein, budget ₹500/day hai, Diwali aa rahi hai — kya strategy banaun?"
                </p>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 rounded bg-orange-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">A</div>
                    <span className="text-xs font-semibold text-orange-400">AdPilot</span>
                    <span className="ml-auto text-[10px] text-white/25 bg-white/5 rounded-full px-2 py-0.5">90 seconds</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "12 Diwali keywords generated",
                      "3 audience segments built",
                      "₹500/day budget plan ready",
                      "Hindi + English ad copies done",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Platform chips */}
              <div className="absolute -bottom-3 -left-5 rounded-xl border border-white/10 bg-[#0f1117]/90 backdrop-blur px-3.5 py-2 shadow-xl">
                <p className="text-xs font-bold text-white/80 leading-none">Google + Meta</p>
                <p className="text-[10px] text-white/35 mt-0.5">Campaigns supported</p>
              </div>
              <div className="absolute -top-4 -right-4 rounded-xl border border-white/10 bg-[#0f1117]/90 backdrop-blur px-3.5 py-2 shadow-xl">
                <p className="text-xs font-bold text-white/80 leading-none">Hindi supported</p>
                <p className="text-[10px] text-white/35 mt-0.5">Type in any language</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.015] py-4 overflow-hidden">
        <div className="flex gap-12 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0">
              {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Indore", "Jaipur", "Bhopal", "Surat", "Lucknow", "Chennai"].map((city) => (
                <span key={city} className="text-sm text-white/22 font-medium tracking-wide">{city}</span>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-white/14 mt-2 tracking-wider uppercase">Businesses across India trust AdPilot</p>
      </div>

      {/* ── CAPABILITY STRIP ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔍", title: "Google Ads",      desc: "Search, Display, and Performance Max campaigns" },
            { icon: "📱", title: "Meta Ads",        desc: "Facebook and Instagram ads with audience targeting" },
            { icon: "🇮🇳", title: "Hindi + English", desc: "Type your brief in any language — we understand" },
            { icon: "⚡", title: "90-second output", desc: "Complete strategy generated, not just keywords" },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5">
              <p className="text-2xl mb-3">{c.icon}</p>
              <p className="font-bold text-sm text-white mb-1">{c.title}</p>
              <p className="text-xs text-white/38 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES (bento) ───────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-orange-400 text-[11px] font-semibold uppercase tracking-[0.18em] mb-3">Complete marketing toolkit</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">One platform. Full team.</h2>
          <p className="text-white/35 mt-3 text-base max-w-sm mx-auto">Replace your ₹50,000/month agency with AI that knows Indian markets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campaign Builder: col-span-2 */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-7 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-start justify-between mb-5">
              <div className="h-11 w-11 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-[10px] font-bold bg-orange-500/18 text-orange-300 rounded-full px-2.5 py-1">Most Popular</span>
            </div>
            <h3 className="text-lg font-bold mb-2">AI Campaign Builder</h3>
            <p className="text-sm text-white/45 leading-relaxed max-w-sm">
              Describe your business in plain language. Get complete Google Search and Meta campaigns with keywords, audiences, A/B variants, and India-specific strategy in 90 seconds.
            </p>
          </div>

          {/* Website Audit: col-span-1 */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-7 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="h-11 w-11 rounded-xl bg-blue-500/20 flex items-center justify-center mb-5">
              <Search className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Website Audit</h3>
            <p className="text-sm text-white/45 leading-relaxed">Full SEO, speed, and conversion audit with prioritised fix recommendations.</p>
          </div>

          {/* Creative Generator: col-span-1 */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-7 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="h-11 w-11 rounded-xl bg-purple-500/20 flex items-center justify-center mb-5">
              <Paintbrush className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Creative Generator</h3>
            <p className="text-sm text-white/45 leading-relaxed">AI writes ad copy and generates background images. Download as PNG.</p>
          </div>

          {/* Competitor Intelligence: col-span-2 */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-7 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-start justify-between mb-5">
              <div className="h-11 w-11 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-[10px] font-bold bg-blue-500/18 text-blue-300 rounded-full px-2.5 py-1">Real-time Data</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Competitor Intelligence</h3>
            <p className="text-sm text-white/45 leading-relaxed max-w-sm">
              See what ads your competitors are running, what keywords they rank for, and where their traffic comes from. Get a complete strategy to beat them.
            </p>
          </div>

          {/* Growth Manager: col-span-1 */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-7 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 flex items-center justify-center mb-5">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Growth Manager</h3>
            <p className="text-sm text-white/45 leading-relaxed">AI-powered weekly marketing strategy for your campaigns and leads.</p>
          </div>

          {/* WhatsApp Agent: col-span-2 (coming soon) */}
          <div className="md:col-span-2 rounded-2xl border border-white/6 bg-white/[0.015] p-7">
            <div className="flex items-start justify-between mb-5">
              <div className="h-11 w-11 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-green-400/70" />
              </div>
              <span className="text-[10px] font-bold bg-green-500/12 text-green-400/80 rounded-full px-2.5 py-1">Coming in Phase 2</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white/45">WhatsApp AI Agent</h3>
            <p className="text-sm text-white/25 leading-relaxed max-w-sm">
              Automatically qualify leads on WhatsApp, answer FAQs, and book appointments — in Hindi, Hinglish, or English.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/7 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Campaign live in 90 seconds</h2>
            <p className="text-white/35 mt-3 text-base">No technical skills. No jargon. No agency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                iconBg: "bg-blue-500/15",
                iconColor: "text-blue-400",
                action: "Describe",
                title: "Tell us about your business",
                desc: "Type in Hindi, Hinglish, or English. Share your business type, city, budget, and goal.",
                example: '"Meri coaching institute hai Bhopal mein. JEE/NEET ke liye. Budget ₹1000/day."',
              },
              {
                icon: Sparkles,
                iconBg: "bg-orange-500/15",
                iconColor: "text-orange-400",
                action: "Generate",
                title: "AI builds your full strategy",
                desc: "Keywords, audience targeting, A/B variants, Hindi ad copies, and India-specific tactics — all done.",
                example: "15 keywords · 3 A/B variants · 3 audience segments · Day-parting strategy",
              },
              {
                icon: Rocket,
                iconBg: "bg-green-500/15",
                iconColor: "text-green-400",
                action: "Launch",
                title: "Download and go live",
                desc: "Export creatives as PNG. Use the strategy on Meta and Google. Watch leads arrive.",
                example: "Est. 156 leads/month · ₹380 per lead · 3.2x ROAS",
              },
            ].map((step, i) => (
              <div key={step.action} className="relative">
                {i < 2 && (
                  <div className="hidden md:flex absolute top-7 left-[calc(100%+0.75rem)] items-center justify-center w-6">
                    <ChevronRight className="h-4 w-4 text-white/14" />
                  </div>
                )}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 h-full flex flex-col">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 shrink-0 ${step.iconBg}`}>
                    <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>
                  <p className="text-[10px] font-semibold text-white/25 mb-1 tracking-wide">{step.action}</p>
                  <h3 className="font-bold text-base mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-5 flex-1">{step.desc}</p>
                  <div className="rounded-lg bg-white/5 border border-white/6 px-3 py-2.5 text-xs text-white/30 italic mt-auto">
                    {step.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-orange-400 text-[11px] font-semibold uppercase tracking-[0.18em] mb-3">Customer results</p>
          <h2 className="text-4xl font-black tracking-tight">Indian businesses. Real numbers.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Priya Sharma",
              biz: "Sharma Saree House, Indore",
              initials: "PS",
              color: "from-pink-500 to-rose-600",
              quote: "Pehle agency ko ₹40,000/month deti thi aur results khaas nahi the. AdPilot se Diwali campaign banaya — ₹8,000 mein ₹2.1 lakh ki sales. Sach mein magic hai!",
              result: "26x ROAS · Diwali campaign",
            },
            {
              name: "Rahul Mishra",
              biz: "Coaching Institute, Bhopal",
              initials: "RM",
              color: "from-blue-500 to-indigo-600",
              quote: "JEE/NEET season mein AdPilot ne Hindi mein perfect keywords aur audience diya. 156 leads aaye, 23 admissions confirm. Best investment.",
              result: "156 leads · ₹380/lead",
            },
            {
              name: "Ankit Gupta",
              biz: "Spice Garden Restaurant, Pune",
              initials: "AG",
              color: "from-orange-500 to-amber-600",
              quote: "Weekend footfall ₹500/day mein double ho gaya. AI ne automatically Friday-Sunday pe zyada budget lagaya. Bilkul sahi strategy.",
              result: "2x footfall · ₹500/day budget",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{t.name}</p>
                  <p className="text-xs text-white/32 truncate">{t.biz}</p>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed flex-1">
                {"“"}{t.quote}{"”"}
              </p>
              <div className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/15 px-3 py-2">
                <TrendingUp className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <span className="text-xs text-orange-300 font-semibold">{t.result}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING CTA ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-orange-500/18 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Start free today.</h2>
          <p className="text-white/40 text-base mb-8">
            Plans from <span className="text-white font-bold">₹999/month</span>. Cancel anytime. No agency lock-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-black text-white shadow-2xl shadow-orange-500/25 hover:opacity-95 hover:shadow-orange-500/40 transition-all"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              View all plans
            </Link>
          </div>
          <p className="text-xs text-white/22 mt-5">50 free credits on signup · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="max-w-[260px]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black text-white shrink-0">A</div>
                <span className="text-[15px] font-bold">AdPilot <span className="text-orange-400">India</span></span>
              </div>
              <p className="text-sm text-white/28 leading-relaxed">AI-powered digital marketing for Indian small businesses. Campaign to revenue in 90 seconds.</p>
            </div>
            <div className="flex gap-14">
              <div>
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  {[["Features", "#features"], ["Pricing", "/pricing"], ["Login", "/login"], ["Sign up", "/signup"]].map(([l, h]) => (
                    <a key={l} href={h} className="text-sm text-white/28 hover:text-white transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Legal</p>
                <div className="flex flex-col gap-2">
                  {["Privacy Policy", "Terms of Service", "Refund Policy"].map((l) => (
                    <span key={l} className="text-sm text-white/18 cursor-not-allowed">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/18">© 2026 AdPilot India. All rights reserved.</p>
            <p className="text-xs text-white/18">Made in India · AI-powered · For Indian SMBs</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
