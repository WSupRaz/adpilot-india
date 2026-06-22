"use client";

import { Sparkles } from "lucide-react";

// This component is a static nudge for now.
// Phase 2: fetch from /api/v1/india/upcoming-events and show real festival context.
export function FestivalAlert() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-indexed

  // Show relevant seasonal nudge based on current month
  const nudge = getSeasonalNudge(month);
  if (!nudge) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
      <Sparkles className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-orange-900 dark:text-orange-200">{nudge.title}</p>
        <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">{nudge.body}</p>
      </div>
    </div>
  );
}

function getSeasonalNudge(month: number) {
  const nudges: Record<number, { title: string; body: string }> = {
    9:  { title: "Navratri season is here!", body: "Increase your budgets by 30–50% for the next 3 weeks. Fashion, jewellery, and food businesses perform 2× better." },
    10: { title: "Diwali is 4–6 weeks away!", body: "Start your Diwali campaigns now — ad costs rise 40% in the last 2 weeks. Early movers win." },
    11: { title: "Wedding season is starting!", body: "Catering, photography, and fashion businesses: increase budgets and target newly-engaged couples." },
    3:  { title: "Holi is coming! 🎨", body: "Colour, fashion, food & beverage, and consumer brands should launch themed campaigns this week." },
    4:  { title: "IPL season is live!", body: "Food delivery, beverages, and electronics brands see 40% higher CTR during match days." },
    7:  { title: "Monsoon season started!", body: "Healthcare, rainwear, home improvement, and food delivery campaigns perform well in July–September." },
    12: { title: "Christmas & New Year is near!", body: "Hospitality, travel, gifting, and apparel brands: launch your year-end campaigns now." },
  };
  return nudges[month] ?? null;
}
