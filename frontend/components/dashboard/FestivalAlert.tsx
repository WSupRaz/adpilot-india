"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FestivalAlert() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const nudge = getSeasonalNudge(month);
  if (!nudge) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-4 text-white shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 h-full w-32 opacity-10">
        <div className="h-24 w-24 rounded-full bg-white absolute -right-8 -top-8" />
        <div className="h-16 w-16 rounded-full bg-white absolute right-4 bottom-0" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">
          {nudge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{nudge.title}</p>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{nudge.body}</p>
        </div>
        <Link
          href="/campaigns/new"
          className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          Launch <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function getSeasonalNudge(month: number) {
  const nudges: Record<number, { title: string; body: string; emoji: string }> = {
    9:  { emoji: "🪔", title: "Navratri season is here!", body: "Fashion, jewellery, and food businesses perform 2× better. Increase your budgets by 30–50% for the next 3 weeks." },
    10: { emoji: "🎆", title: "Diwali is 4–6 weeks away!", body: "Start your Diwali campaigns now — ad costs rise 40% in the final 2 weeks. Early movers always win." },
    11: { emoji: "💍", title: "Wedding season is starting!", body: "Catering, photography, and fashion businesses should increase budgets and target newly-engaged couples." },
    3:  { emoji: "🎨", title: "Holi is coming!", body: "Colour, fashion, food & beverage, and consumer brands should launch themed campaigns this week." },
    4:  { emoji: "🏏", title: "IPL season is live!", body: "Food delivery, beverages, and electronics brands see 40% higher CTR during match days." },
    6:  { emoji: "🌧️", title: "Monsoon season started!", body: "Healthcare, rainwear, home improvement, and food delivery campaigns perform well in June–September." },
    7:  { emoji: "🌧️", title: "Peak monsoon!", body: "Home improvement, food delivery, and indoor entertainment brands — this is your moment." },
    12: { emoji: "🎄", title: "Christmas & New Year is near!", body: "Hospitality, travel, gifting, and apparel brands: launch your year-end campaigns now." },
  };
  return nudges[month] ?? null;
}
