import Link from "next/link";

export const metadata = { title: "AdPilot India — AI Marketing for Indian SMBs" };

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow  { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .float   { animation: float 4s ease-in-out infinite }
        .glow    { animation: glow 3s ease-in-out infinite }
        .slide   { animation: slide 28s linear infinite }
        .fade-up { animation: fadeUp .7s ease forwards }
        .grad-text {
          background: linear-gradient(135deg, #ff6b35 0%, #f7c948 50%, #ff6b35 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .card-glow:hover { box-shadow: 0 0 32px rgba(255,107,53,.18); transform: translateY(-4px); }
        .card-glow { transition: all .3s ease; }
        .hero-glow {
          position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black">A</div>
            <span className="text-lg font-bold">AdPilot <span className="text-orange-400">India</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[["Features","#features"],["How it works","#how"],["Pricing","/pricing"]].map(([label,href])=>(
              <a key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all">
              Start Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background glows */}
        <div className="hero-glow w-[600px] h-[600px] bg-orange-500/20 top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 glow" />
        <div className="hero-glow w-[400px] h-[400px] bg-amber-400/10 bottom-0 right-0" />
        <div className="hero-glow w-[300px] h-[300px] bg-orange-600/10 top-1/2 left-0" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'60px 60px'}} />

        <div className="relative max-w-5xl mx-auto px-6 text-center fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 glow inline-block" />
            🇮🇳 Built exclusively for Indian SMBs
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Your AI Marketing
            <br />
            <span className="grad-text">Employee.</span>
            <br />
            <span className="text-white/80 text-4xl md:text-5xl font-bold">Works 24/7. Never asks for a raise.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed">
            Describe your business in <strong className="text-white/80">Hindi, Hinglish, or English</strong>.
            Get professional Google &amp; Meta ad campaigns, creatives, and strategy — in 90 seconds.
          </p>

          {/* Hindi quote card */}
          <div className="inline-block rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-6 py-3 mb-10 text-sm text-white/70 italic">
            "Meri saree shop hai Bhopal mein, budget ₹500/day hai, diwali aa rahi hai…" &nbsp;
            <span className="text-orange-400 not-italic font-semibold">→ Full campaign in 90 seconds ✓</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-base font-black text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all">
              Start Free Trial — No Credit Card
            </Link>
            <Link href="/login" className="rounded-full border border-white/15 bg-white/5 backdrop-blur px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all">
              See Live Demo →
            </Link>
          </div>

          {/* Floating stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { num: "90s",    label: "Campaign ready",    color: "from-orange-500/20 to-amber-500/10" },
              { num: "₹150",   label: "Avg. cost per lead", color: "from-blue-500/20 to-cyan-500/10" },
              { num: "500+",   label: "SMBs onboarded",    color: "from-purple-500/20 to-pink-500/10" },
              { num: "3.2x",   label: "Avg. ROAS",          color: "from-green-500/20 to-emerald-500/10" },
            ].map((s) => (
              <div key={s.num} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${s.color} backdrop-blur p-4 float`}>
                <p className="text-2xl font-black grad-text">{s.num}</p>
                <p className="text-xs text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="border-y border-white/5 bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex gap-12 slide whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0">
              {["Mumbai","Delhi","Bangalore","Hyderabad","Pune","Ahmedabad","Indore","Jaipur","Bhopal","Surat","Lucknow","Chennai"].map(city=>(
                <span key={city} className="text-sm text-white/30 font-medium">{city}</span>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/20 mt-2">Businesses from across India trust AdPilot</p>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-black">One platform. Full marketing team.</h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">Replace your ₹50,000/month agency with AI that knows Indian markets better.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: "🎯", title: "AI Campaign Builder",
              desc: "Describe your business in plain language. Get complete Google Search + Meta campaigns with keywords, audiences, A/B variants, and India-specific strategy in 90 seconds.",
              tag: "Most Popular", tagColor: "bg-orange-500/20 text-orange-300",
              grad: "from-orange-500/10 to-amber-500/5",
            },
            {
              icon: "🖼️", title: "Creative Generator",
              desc: "AI writes ad copy and generates cinematic background images using DALL-E 3. Upload your shop photo or logo for a personalised creative. Download as PNG.",
              tag: "DALL-E 3 Powered", tagColor: "bg-purple-500/20 text-purple-300",
              grad: "from-purple-500/10 to-pink-500/5",
            },
            {
              icon: "🔍", title: "Website Audit",
              desc: "Full SEO, speed, and conversion audit of your website. Get a prioritised list of fixes with estimated impact on traffic and leads.",
              tag: "Instant Report", tagColor: "bg-blue-500/20 text-blue-300",
              grad: "from-blue-500/10 to-cyan-500/5",
            },
            {
              icon: "🕵️", title: "Competitor Intelligence",
              desc: "See what ads your competitors are running, what keywords they rank for, and where their traffic comes from. Beat them at their own game.",
              tag: "Real-time Data", tagColor: "bg-red-500/20 text-red-300",
              grad: "from-red-500/10 to-orange-500/5",
            },
            {
              icon: "💬", title: "WhatsApp AI Agent",
              desc: "Automatically qualify leads on WhatsApp, answer FAQs, and book appointments — in Hindi, Hinglish, or English. Works while you sleep.",
              tag: "Phase 2", tagColor: "bg-green-500/20 text-green-300",
              grad: "from-green-500/10 to-emerald-500/5",
            },
            {
              icon: "📈", title: "Growth Manager",
              desc: "Track your campaigns, creatives, and leads in one dashboard. Get AI-powered weekly recommendations on what to fix and what to scale.",
              tag: "AI Insights", tagColor: "bg-amber-500/20 text-amber-300",
              grad: "from-amber-500/10 to-yellow-500/5",
            },
          ].map((f) => (
            <div key={f.title} className={`card-glow rounded-2xl border border-white/8 bg-gradient-to-br ${f.grad} p-6 flex flex-col gap-4`}>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{f.icon}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${f.tagColor}`}>{f.tag}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative py-28 overflow-hidden">
        <div className="hero-glow w-[500px] h-[500px] bg-orange-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple as 1-2-3</p>
            <h2 className="text-4xl md:text-5xl font-black">From idea to campaign in 90 seconds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01", title: "Tell us about your business",
                desc: "Type in Hindi, Hinglish, or English. Tell us your business type, city, budget, and goal. No forms, no jargon.",
                example: '"Meri coaching institute hai Bhopal mein. JEE/NEET ke liye. Budget ₹1000/day."',
              },
              {
                step: "02", title: "AI builds your full strategy",
                desc: "Our AI generates keywords, audience targeting, A/B test variants, Hindi ad copies, and India-specific tactics.",
                example: "15 keywords · 3 A/B variants · 3 audience segments · Day-parting strategy",
              },
              {
                step: "03", title: "Download, launch, and grow",
                desc: "Export your creatives as PNG. Use the strategy to launch on Meta and Google. Watch leads come in.",
                example: "Est. 156 leads/month · ₹380 per lead · 3.2x ROAS",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-orange-500/30 to-transparent -translate-y-1/2 z-10" />
                )}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 h-full">
                  <div className="text-5xl font-black grad-text mb-4">{s.step}</div>
                  <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-sm text-white/50 mb-4 leading-relaxed">{s.desc}</p>
                  <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-xs text-white/40 italic">
                    {s.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS NUMBERS ── */}
      <section className="border-y border-white/5 bg-gradient-to-r from-orange-500/5 to-amber-500/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-white/40 text-sm mb-10 uppercase tracking-widest">Real results from Indian SMBs</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "₹150",  sub: "Average cost per lead",  note: "vs ₹600+ with agencies" },
              { num: "3.2x",  sub: "Average ROAS",            note: "across all categories" },
              { num: "90s",   sub: "Campaign generation time", note: "not 2 weeks" },
              { num: "500+",  sub: "SMBs using AdPilot",       note: "and growing" },
            ].map((r) => (
              <div key={r.num}>
                <p className="text-5xl font-black grad-text">{r.num}</p>
                <p className="text-sm font-semibold text-white/70 mt-2">{r.sub}</p>
                <p className="text-xs text-white/30 mt-1">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">What our customers say</p>
          <h2 className="text-4xl font-black">Indian businesses. Real results.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Priya Sharma", biz: "Sharma Saree House, Indore",
              avatar: "PS", color: "from-pink-500 to-rose-600",
              quote: "Pehle agency ko ₹40,000/month deti thi aur results khaas nahi the. AdPilot se Diwali campaign banaya — ₹8,000 mein ₹2.1 lakh ki sales ho gayi. Sach mein magic hai!",
              results: "26x ROAS · Diwali campaign",
            },
            {
              name: "Rahul Mishra", biz: "Rahul's Coaching Institute, Bhopal",
              avatar: "RM", color: "from-blue-500 to-indigo-600",
              quote: "JEE/NEET admission season mein pehle Facebook pe waste karta tha. AdPilot ne Hindi mein perfect keywords aur audience diya. 156 leads aaye, 23 admissions confirm. Best investment.",
              results: "156 leads · ₹380/lead",
            },
            {
              name: "Ankit Gupta", biz: "Spice Garden Restaurant, Pune",
              avatar: "AG", color: "from-orange-500 to-amber-600",
              quote: "Weekend footfall ₹500/day mein double ho gaya. AI ne automatically Friday-Sunday pe zyada budget lagaya aur 5km radius target kiya. Bilkul sahi strategy.",
              results: "2x footfall · ₹500/day budget",
            },
          ].map((t) => (
            <div key={t.name} className="card-glow rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-black`}>{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-white/40">{t.biz}</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed italic">"{t.quote}"</p>
              <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-300 font-semibold">
                📈 {t.results}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-10 text-center">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-4">Simple pricing</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3">Start free. No credit card.</h2>
          <p className="text-white/50 mb-8 text-lg">Plans from <span className="text-white font-bold">₹999/month</span>. Cancel anytime. No agency lock-in.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 font-black text-white shadow-2xl shadow-orange-500/30 hover:scale-105 transition-all">
              Start 14-Day Free Trial
            </Link>
            <Link href="/pricing" className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all">
              View all plans →
            </Link>
          </div>
          <p className="text-xs text-white/30 mt-6">50 free credits on signup · Google & Meta campaigns · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black">A</div>
                <span className="text-lg font-bold">AdPilot <span className="text-orange-400">India</span></span>
              </div>
              <p className="text-sm text-white/30 max-w-xs">AI-powered digital marketing platform built for Indian small businesses.</p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  {[["Features","#features"],["Pricing","/pricing"],["Login","/login"],["Sign up","/signup"]].map(([l,h])=>(
                    <a key={l} href={h} className="text-sm text-white/30 hover:text-white transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Legal</p>
                <div className="flex flex-col gap-2">
                  {["Privacy Policy","Terms of Service","Refund Policy"].map(l=>(
                    <span key={l} className="text-sm text-white/30 cursor-not-allowed">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© 2026 AdPilot India. All rights reserved.</p>
            <p className="text-xs text-white/20">🇮🇳 Made in India · AI-powered · For Indian SMBs</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
