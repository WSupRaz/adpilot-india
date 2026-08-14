import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Zap, IndianRupee } from "lucide-react";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create Account — AdPilot India" };

export default function SignupPage() {
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
            Your AI marketing team.<br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              Starts free today.
            </span>
          </h1>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            No agency fees. No contracts. Just describe your business and get campaigns in 90 seconds.
          </p>
        </div>

        {/* What you get */}
        <div className="relative space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-4">What you get free</p>
          {[
            { icon: Zap,          text: "50 AI credits to get started" },
            { icon: CheckCircle2, text: "Full campaign builder access" },
            { icon: IndianRupee,  text: "No credit card required" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <p className="text-sm text-white/50">{text}</p>
            </div>
          ))}

          {/* Mini stat */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4 text-center">
              <p className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">90s</p>
              <p className="text-[11px] text-white/35 mt-1">Campaign ready</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4 text-center">
              <p className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">₹150</p>
              <p className="text-[11px] text-white/35 mt-1">Avg cost/lead</p>
            </div>
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
              <h2 className="text-xl font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Free 14-day trial. No credit card required.</p>
            </div>

            <SignupForm />

            <p className="text-center text-sm text-muted-foreground mt-5">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
