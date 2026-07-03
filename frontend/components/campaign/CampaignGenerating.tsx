"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Analyzing your business profile",         detail: "Reading business type, city, and goal",              delay: 0 },
  { id: 2, label: "Researching keywords & search volume",    detail: "Finding what your customers search for in Google",    delay: 3500 },
  { id: 3, label: "Writing ad headlines in Hindi & English", detail: "Crafting 3 A/B variants to find what converts best", delay: 8000 },
  { id: 4, label: "Building audience segments",              detail: "Segmenting by demographics, interests & behaviour",   delay: 13500 },
  { id: 5, label: "Applying India market intelligence",      detail: "City insights, festival context, competitor gaps",    delay: 19000 },
  { id: 6, label: "Calculating budget & outcome estimates",  detail: "Estimating leads, cost-per-lead, and ROAS",          delay: 25000 },
];

interface CampaignGeneratingProps {
  businessName: string;
  goal: string;
  city?: string;
}

export function CampaignGenerating({ businessName, goal, city }: CampaignGeneratingProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      if (i === 0) return;
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i]);
          setActiveStep(i + 1);
        }, step.delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Animated dots
  useEffect(() => {
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(iv);
  }, []);

  const goalLabel: Record<string, string> = {
    leads: "Leads", calls: "Phone Calls", bookings: "Bookings",
    sales: "Sales", brand_awareness: "Brand Awareness",
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold">Building your campaign{dots}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-foreground">{businessName}</span>
          {" · "}{goalLabel[goal] ?? goal}{city ? ` · ${city}` : ""}
        </p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = activeStep === step.id && !isDone;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl p-3.5 transition-all duration-500 ${
                isDone
                  ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                  : isActive
                  ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
                  : "bg-muted/30 border border-transparent"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-snug ${
                  isDone ? "text-green-700 dark:text-green-400"
                  : isActive ? "text-orange-700 dark:text-orange-400"
                  : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                {(isDone || isActive) && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center mt-6 max-w-xs">
        Our AI is building 3 A/B test variants and detailed audience segments tailored to the {city ?? "Indian"} market.
      </p>
    </div>
  );
}
