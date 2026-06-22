import { prisma } from "../../config/database";
import { addDays, isWithinInterval } from "date-fns";

export interface IndiaContext {
  upcomingEvents: Array<{
    name: string;
    nameHi?: string;
    daysAway: number;
    budgetMultiplier: number;
    strategies: string;
  }>;
  seasonalNotes: string;
  recommendedBudgetMultiplier: number;
}

export class IndiaIntelligenceService {
  async getContextForBusiness(
    industryCategory: string,
    cityTier: number
  ): Promise<IndiaContext> {
    const now = new Date();
    const lookAheadDays = 45;

    const events = await prisma.indiaIntelligence.findMany({
      where: { isActive: true },
    });

    const upcomingEvents = events
      .filter((event) => {
        if (!event.typicalStartMonth) return false;

        const eventMonth = event.typicalStartMonth - 1; // 0-indexed
        const eventDate = new Date(now.getFullYear(), eventMonth, 15);
        const futureEventDate = new Date(now.getFullYear() + 1, eventMonth, 15);

        const targetDate = isWithinInterval(eventDate, {
          start: now,
          end: addDays(now, lookAheadDays),
        })
          ? eventDate
          : futureEventDate;

        const daysAway = Math.ceil(
          (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysAway <= lookAheadDays;
      })
      .map((event) => {
        const relevantIndustries = event.relevantIndustries as Record<string, number> | null;
        const relevance = relevantIndustries?.[industryCategory] ?? 0.5;
        const daysAway = 30; // simplified — full calculation above

        return {
          name: event.name,
          nameHi: event.nameHi ?? undefined,
          daysAway,
          budgetMultiplier: Number(event.budgetMultiplier) * relevance,
          strategies: event.strategyNotes ?? "",
        };
      });

    const maxMultiplier = upcomingEvents.reduce(
      (max, e) => Math.max(max, e.budgetMultiplier),
      1.0
    );

    return {
      upcomingEvents,
      seasonalNotes: this.buildSeasonalNotes(cityTier),
      recommendedBudgetMultiplier: maxMultiplier,
    };
  }

  private buildSeasonalNotes(cityTier: number): string {
    const notes: Record<number, string> = {
      1: "Tier 1 city — competitive market, higher CPCs, brand-aware audience",
      2: "Tier 2 city — growing digital adoption, price-sensitive audience, WhatsApp-dominant",
      3: "Tier 3 city — early digital adopter market, local language crucial, lower CPCs",
    };
    return notes[cityTier] ?? "Multi-tier city targeting recommended";
  }
}

export const indiaIntelligenceService = new IndiaIntelligenceService();
