import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { createCampaignSchema, updateCampaignSchema } from "../../validators/campaign.schema";
import { prisma } from "../../config/database";
import { creditService } from "../../services/CreditService";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { indiaIntelligenceService } from "../../services/india/IndiaIntelligenceService";
import { detectLanguage } from "../../lib/helpers";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import { success, created } from "../../lib/response";
import { paginate } from "../../lib/helpers";
import { logger } from "../../lib/logger";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

// ── List campaigns ─────────────────────────────────────────────────────────────
campaignRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const { skip, take } = paginate(page, limit);
    const status = req.query.status as string | undefined;
    const businessId = req.query.businessId as string | undefined;

    const where = {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(businessId ? { businessId } : {}),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          goal: true,
          platform: true,
          status: true,
          dailyBudgetPaise: true,
          totalSpendPaise: true,
          totalImpressions: true,
          totalClicks: true,
          totalConversions: true,
          festivalContext: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          business: { select: { id: true, name: true, city: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return success(res, campaigns, 200, { page, limit, total });
  } catch (err) {
    next(err);
  }
});

// ── Create + generate AI campaign synchronously (no BullMQ/Redis needed) ──────
campaignRouter.post("/", aiRateLimit, validate(createCampaignSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: req.body.businessId, ownerId: userId, deletedAt: null },
    });
    if (!business) throw new NotFoundError("Business");

    // Deduct credits before generating
    await creditService.checkAndDeduct(userId, "campaign_generate");

    const language = detectLanguage(req.body.goalDescription ?? "");
    const intelligence = await indiaIntelligenceService.getContextForBusiness(
      business.businessType ?? "",
      business.cityTier ?? 2
    ).catch(() => null);

    const messages = promptRegistry.build("campaign_generate", {
      businessName: business.name,
      businessType: business.businessType ?? "business",
      city: business.city ?? "India",
      state: business.state ?? "",
      cityTier: business.cityTier ?? 2,
      goal: req.body.goal,
      goalDescription: req.body.goalDescription,
      platforms: (req.body.platforms as string[]).join(", "),
      dailyBudgetRupees: Math.round(req.body.dailyBudgetPaise / 100),
      festivalContext: req.body.festivalContext ?? (intelligence as any)?.upcomingEvents?.[0]?.name,
      seasonalNotes: (intelligence as any)?.seasonalNotes,
      language,
    });

    let aiData: any;
    let aiModel = "fallback";
    let aiCost = 0;

    try {
      // Race the AI call against a 25-second timeout
      const aiResult = await Promise.race([
        aiRouter.complete({
          task: "campaign_generate",
          language: language as any,
          messages,
          maxTokens: 4000,
          userId,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI generation timed out")), 25000)
        ),
      ]);

      try {
        aiData = JSON.parse((aiResult as any).content);
      } catch {
        aiData = { raw: (aiResult as any).content };
      }
      aiModel = (aiResult as any).response.model;
      aiCost = (aiResult as any).response.costUSD;
    } catch (aiErr: any) {
      logger.warn(`AI generation failed, using fallback strategy: ${aiErr.message}`);
      aiData = buildFallbackStrategy(business, req.body);
    }

    const platforms: string[] = req.body.platforms;
    const platform =
      platforms.includes("google") && platforms.includes("meta") ? "both" : platforms[0];

    const campaign = await prisma.campaign.create({
      data: {
        businessId: req.body.businessId,
        userId,
        name: aiData.campaign_name ?? `${business.name} — ${req.body.goal} Campaign`,
        goal: req.body.goal,
        platform: platform as any,
        status: "draft",
        dailyBudgetPaise: req.body.dailyBudgetPaise,
        aiStrategy: aiData,
        aiModelUsed: aiModel,
        aiGenerationCost: aiCost,
        festivalContext: req.body.festivalContext ?? null,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });

    logger.info(`Campaign generated synchronously: ${campaign.id} for user ${userId}`);

    return success(res, { campaign_id: campaign.id, status: "ready" }, 201);
  } catch (err) {
    next(err);
  }
});

// ── Fallback strategy (used when AI is unavailable) ───────────────────────────
function buildFallbackStrategy(business: any, input: any): any {
  const name = business.name ?? "Your Business";
  const city = business.city ?? "India";
  const goal = input.goal ?? "leads";
  const budgetRupees = Math.round((input.dailyBudgetPaise ?? 50000) / 100);
  const platforms: string[] = input.platforms ?? ["google", "meta"];

  const goalCta: Record<string, string> = {
    leads: "Get Free Quote", calls: "Call Now", bookings: "Book Now",
    sales: "Buy Now", brand_awareness: "Learn More",
  };
  const cta = goalCta[goal] ?? "Contact Us";

  return {
    campaign_name: `${name} — ${goal.charAt(0).toUpperCase() + goal.slice(1)} Campaign`,
    strategy_rationale: `AI-optimised ${goal} campaign for ${name} in ${city}. Budget of ₹${budgetRupees}/day allocated across ${platforms.join(" & ")} for maximum reach and conversions.`,
    google: {
      bidding_strategy: goal === "leads" || goal === "calls" ? "Maximize Conversions" : "Target ROAS",
      keywords: [
        `${name.toLowerCase()}`,
        `${business.businessType ?? "service"} in ${city}`,
        `best ${business.businessType ?? "business"} ${city}`,
        `${city} ${business.businessType ?? "service"}`,
        `${goal} ${business.businessType ?? "service"}`,
      ],
      negative_keywords: ["free", "DIY", "tutorial", "how to"],
      ad_groups: [
        { name: `${name} — Brand`, theme: "Direct brand searches" },
        { name: `${business.businessType ?? "Service"} — Category`, theme: "Category intent searches" },
      ],
    },
    meta: {
      audience: {
        age_min: 22,
        age_max: 55,
        locations: [city],
        interests: [business.businessType ?? "business", "local services", "India"],
      },
      ad_sets: [
        { name: "Local Awareness", objective: "REACH" },
        { name: "Conversion Focus", objective: "CONVERSIONS" },
      ],
    },
    ads: [
      {
        type: "google_responsive_search",
        headlines: [
          `${name} in ${city}`,
          `Best ${business.businessType ?? "Service"} — ${city}`,
          `${cta} · Trusted & Reliable`,
          `Top Rated · ${city} · Call Today`,
        ],
        descriptions: [
          `${name} — Trusted by customers in ${city}. Professional service at best prices. ${cta} now!`,
          `Looking for the best ${business.businessType ?? "service"} in ${city}? We deliver results. Contact us today.`,
        ],
      },
      {
        type: "meta_feed",
        primary_text: `🌟 Looking for the best ${business.businessType ?? "service"} in ${city}? ${name} has you covered! Quality service, trusted by hundreds of happy customers. ${cta} today!`,
        headline: `${name} — ${city}'s Trusted Choice`,
        cta,
      },
    ],
    expected_outcomes: {
      leads_per_month: Math.round((budgetRupees * 30) / 180),
      cost_per_lead_estimate: 150,
    },
    india_intelligence_notes: `${city} market optimised. ${goal === "calls" ? "Call extensions recommended for mobile users." : "Form fill ads recommended for lead capture."} Ads in Hindi and English recommended for better reach.`,
  };
}

// ── Get campaign ───────────────────────────────────────────────────────────────
campaignRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
      include: {
        business: {
          select: { id: true, name: true, city: true, businessType: true, websiteUrl: true },
        },
      },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    return success(res, campaign);
  } catch (err) {
    next(err);
  }
});

// ── Update campaign (edit before approval) ─────────────────────────────────────
campaignRouter.patch("/:id", validate(updateCampaignSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (!["draft", "pending_review"].includes(campaign.status)) {
      throw new ForbiddenError("Only draft campaigns can be edited");
    }

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.dailyBudgetPaise ? { dailyBudgetPaise: req.body.dailyBudgetPaise } : {}),
        ...(req.body.startDate ? { startDate: new Date(req.body.startDate) } : {}),
        ...(req.body.endDate ? { endDate: new Date(req.body.endDate) } : {}),
      },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Approve campaign ──────────────────────────────────────────────────────────
campaignRouter.post("/:id/approve", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "draft" && campaign.status !== "pending_review") {
      throw new ForbiddenError("Campaign is not in a reviewable state");
    }

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "approved" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Pause ──────────────────────────────────────────────────────────────────────
campaignRouter.post("/:id/pause", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "live") {
      throw new ForbiddenError("Only live campaigns can be paused");
    }
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "paused" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Resume ─────────────────────────────────────────────────────────────────────
campaignRouter.post("/:id/resume", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "paused") {
      throw new ForbiddenError("Only paused campaigns can be resumed");
    }
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "live" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Soft delete ────────────────────────────────────────────────────────────────
campaignRouter.delete("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});
