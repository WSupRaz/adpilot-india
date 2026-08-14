import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In — AdPilot India" };

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#080810] text-white flex-col justify-between p-12 border-r border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-500/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[280px] h-[280px] bg-amber-400/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-16">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black text-white shrink-0">A</div>
            <span className="text-lg font-bold">AdPilot <span className="text-orange-400">India</span></span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-black tracking-tight leading-tight mb-4">
            Welcome back.<br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              Your campaigns missed you.
            </span>
          </h1>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Sign in to continue managing your AI-powered marketing campaigns.
          </p>
        </div>

        {/* Stats */}
        <div className="relative space-y-4">
          {[
            { icon: TrendingUp, text: "3.2x average ROAS across Indian SMBs" },
            { icon: Zap,        text: "Campaigns ready in 90 seconds" },
            { icon: CheckCircle2, text: "500+ businesses growing with AdPilot" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <p className="text-sm text-white/50">{text}</p>
            </div>
          ))}

          {/* Mini testimonial */}
          <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.04] p-4">
            <p className="text-xs text-white/50 leading-relaxed italic">
              "AdPilot se Diwali campaign banaya — ₹8,000 mein ₹2.1 lakh ki sales ho gayi!"
            </p>
            <p className="text-xs text-white/28 mt-2">Priya Sharma, Sharma Saree House, Indore</p>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Logo on mobile */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-sm font-black text-white shrink-0">A</div>
            <span className="text-lg font-bold">AdPilot <span className="text-orange-500">India</span></span>
          </div>

          <div className="rounded-2xl border bg-background p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and password to continue</p>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-muted-foreground mt-5">
              No account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Start free trial
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
