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
  const btype = business.businessType ?? "service";
  const goal = input.goal ?? "leads";
  const budgetRupees = Math.round((input.dailyBudgetPaise ?? 50000) / 100);
  const platforms: string[] = input.platforms ?? ["google", "meta"];

  const googlePct = platforms.includes("google") && platforms.includes("meta") ? 60 : platforms.includes("google") ? 100 : 0;
  const metaPct = 100 - googlePct;

  const ctaMap: Record<string, string> = {
    leads: "GET_QUOTE", calls: "CALL_NOW", bookings: "BOOK_NOW",
    sales: "SHOP_NOW", brand_awareness: "LEARN_MORE",
  };
  const cta = ctaMap[goal] ?? "LEARN_MORE";
  const ctaLabel = cta.replace("_", " ");

  const leadsPerMonth = Math.max(5, Math.round((budgetRupees * 30) / 200));
  const cpl = Math.round(budgetRupees * 30 / leadsPerMonth);

  return {
    campaign_name: `${name} — ${goal.charAt(0).toUpperCase() + goal.slice(1)} Campaign · ${city}`,
    strategy_rationale: `This campaign targets high-intent ${btype} buyers in ${city} who are actively searching for solutions. We split budget ${googlePct}% Google (search intent) and ${metaPct}% Meta (discovery & retargeting) to capture both demand and create new demand.`,
    budget_allocation: {
      google_percent: googlePct,
      meta_percent: metaPct,
      reasoning: `Google captures active searchers; Meta reaches new audiences and retargets website visitors. ${city} has strong mobile usage — both platforms optimised for mobile-first.`,
    },
    google: {
      bidding_strategy: goal === "leads" || goal === "calls"
        ? "Maximize Conversions — lets Google's Smart Bidding find the cheapest leads automatically"
        : "Target ROAS — optimises for return on ad spend based on purchase value",
      match_types: { broad: 20, phrase: 50, exact: 30 },
      keywords: [
        `${btype} in ${city}`,
        `best ${btype} ${city}`,
        `${city} ${btype} near me`,
        `top ${btype} ${city}`,
        `${btype} ${city} price`,
        `affordable ${btype} ${city}`,
        `trusted ${btype} ${city}`,
        `${name.toLowerCase()}`,
        `${btype} service ${city}`,
        `${city} mein ${btype}`,
        `${btype} wala ${city}`,
        `${city} best ${btype}`,
      ],
      negative_keywords: ["free", "DIY", "tutorial", "how to make", "salary", "job", "internship", "review blog", "wholesale only", "franchise"],
      ad_groups: [
        { name: `Brand — ${name}`, theme: "Direct brand name searches", keywords: [`${name}`, `${name} ${city}`, `${name} contact`], estimated_cpc: "₹8–18" },
        { name: `Category — ${btype} in ${city}`, theme: "High-intent category searches", keywords: [`${btype} in ${city}`, `best ${btype} ${city}`, `${btype} near me`], estimated_cpc: "₹12–30" },
        { name: "Local Searches", theme: "Hyperlocal + area searches", keywords: [`${btype} ${city} near me`, `${city} mein ${btype}`, `${btype} wala`], estimated_cpc: "₹6–15" },
      ],
      extensions: [`Visit ${name}`, `Free Consultation`, `Call Now`, `About Us`, `Our Services`, "Trusted by 500+ customers", "Same Day Response", "Free Quote"],
      device_split: { mobile_percent: 75, desktop_percent: 25, reasoning: `${city} users are 75%+ mobile. Prioritise mobile-optimised landing pages and click-to-call.` },
      day_parting: { peak_hours: ["9am–12pm", "7pm–10pm"], low_hours: ["1am–6am"], reasoning: "Indian SMB customers research in morning and evenings. Reduce bids 40% between 1-6am to save budget." },
    },
    meta: {
      campaign_objective: goal === "leads" ? "LEAD_GENERATION" : goal === "sales" ? "CONVERSIONS" : "REACH",
      ad_sets: [
        {
          name: "Core Audience — ${city} Intent",
          audience: {
            age_min: 25, age_max: 50, gender: "ALL",
            locations: [city],
            radius_km: 15,
            interests: [`${btype}`, "local business", "India shopping", "small business"],
            behaviors: ["engaged shoppers", "mobile device users"],
            income_segment: "Top 25%",
            estimated_reach: "45,000 — 120,000 people",
            language: ["Hindi", "English"],
          },
          placement: ["Feed", "Stories", "Reels"],
          budget_percent: 60,
        },
        {
          name: "Lookalike — Website Visitors",
          audience: {
            age_min: 22, age_max: 55, gender: "ALL",
            locations: [city],
            radius_km: 25,
            interests: [`${btype}`, "online shopping"],
            behaviors: ["recent purchase"],
            income_segment: "Middle income",
            estimated_reach: "80,000 — 200,000 people",
            language: ["Hindi", "English"],
          },
          placement: ["Feed", "Reels"],
          budget_percent: 40,
        },
      ],
    },
    audience_segments: [
      {
        name: `Active Searchers in ${city}`,
        size_estimate: "15,000 — 40,000 people",
        description: `People in ${city} who have searched for ${btype} in the last 30 days on Google`,
        pain_point: `Need a reliable ${btype} fast — comparing options and price`,
        targeting_approach: "Google Search + exact/phrase match keywords with strong CTA",
        best_platform: "Google",
        estimated_cpa: `₹${cpl}`,
      },
      {
        name: "Discovery Audience — Social",
        size_estimate: "80,000 — 200,000 people",
        description: `${city} residents aged 25-45 who match the interest profile but haven't searched yet`,
        pain_point: `Don't know ${name} exists — need awareness before they search`,
        targeting_approach: "Meta Feed + Reels with visually engaging creative and local hook",
        best_platform: "Meta",
        estimated_cpa: `₹${Math.round(cpl * 1.4)}`,
      },
      {
        name: "Retargeting — Warm Leads",
        size_estimate: "500 — 5,000 people",
        description: "People who visited your website or engaged with your ad but didn't convert",
        pain_point: "Considered buying but got distracted — need a nudge",
        targeting_approach: "Meta retargeting with testimonial/offer creative + urgency",
        best_platform: "Meta",
        estimated_cpa: `₹${Math.round(cpl * 0.6)}`,
      },
    ],
    ab_variants: [
      {
        variant: "A",
        angle: "Value / Price",
        hypothesis: `Leads in ${city} are price-sensitive — showing ₹ value upfront may drive higher CTR`,
        google_ad: {
          headline_1: `${city}'s Best ${btype.slice(0,20)}`,
          headline_2: "Affordable · Trusted · Fast",
          headline_3: `${ctaLabel} — No Commitment`,
          description_1: `Looking for reliable ${btype} in ${city}? ${name} delivers quality at competitive prices. ${ctaLabel} today.`,
          description_2: `Trusted by hundreds of ${city} customers. Professional service, transparent pricing. Call or enquire now.`,
          display_url: `${city.toLowerCase().replace(/\s/g, "")}.example.com/${btype.replace(/\s/g,"-")}`,
        },
        meta_ad: {
          primary_text: `🎯 Tired of overpriced ${btype} in ${city}? At ${name}, we believe great service shouldn't cost a fortune. Get a free quote today and see the difference yourself!`,
          headline: `${city}'s Most Trusted ${btype.slice(0,30)}`,
          cta_button: cta,
          visual_direction: `Show a happy customer receiving the service + price badge overlay. Clean, bright background. No stock photos — use real business imagery if available.`,
        },
      },
      {
        variant: "B",
        angle: "Trust / Social Proof",
        hypothesis: "Indian buyers heavily rely on social proof — showing customer count or reviews may reduce hesitation",
        google_ad: {
          headline_1: `500+ Happy Customers — ${city}`,
          headline_2: `${name} — 5★ Rated`,
          headline_3: "Enquire Free · Same Day Response",
          description_1: `Join hundreds of satisfied customers in ${city} who trust ${name} for ${btype}. 5-star rated. Fast response guaranteed.`,
          description_2: `"Excellent service and very professional" — Real customer review. See why ${city} chooses ${name}. ${ctaLabel} now.`,
          display_url: `${city.toLowerCase().replace(/\s/g, "")}.example.com/reviews`,
        },
        meta_ad: {
          primary_text: `⭐⭐⭐⭐⭐ "Best decision we made!" — Priya S., ${city}\n\nOver 500 families in ${city} have trusted ${name} for ${btype}. We'd love to help you too. Tap to enquire — it's free!`,
          headline: `Rated #1 ${btype.slice(0,25)} in ${city}`,
          cta_button: cta,
          visual_direction: `Carousel of 3 slides: Slide 1 — 5-star review card with customer name. Slide 2 — Before/after or service in action. Slide 3 — Special offer/CTA.`,
        },
      },
      {
        variant: "C",
        angle: "Urgency / Local",
        hypothesis: "Hyperlocal + limited-time messaging creates FOMO and faster conversions",
        google_ad: {
          headline_1: `${btype.slice(0,20)} Near You — ${city}`,
          headline_2: "Book This Week · Limited Slots",
          headline_3: "Local · Fast · Reliable",
          description_1: `${name} is right here in ${city}. Don't wait — slots this week are filling fast. Enquire now and get priority booking.`,
          description_2: `Same-day response. Serving ${city} for years. Local experts who understand your needs. ${ctaLabel} — takes 30 seconds.`,
          display_url: `${city.toLowerCase().replace(/\s/g, "")}.example.com/book-now`,
        },
        meta_ad: {
          primary_text: `📍 ${city} people — don't miss this!\n\n${name} is offering priority slots this week. We're local, fast, and trusted. Tap below before slots fill up — enquiry is completely free!`,
          headline: `Only a Few Slots Left — ${city}`,
          cta_button: cta,
          visual_direction: `Map pin graphic with ${city} highlighted. Timer graphic or "limited slots" badge. Bold orange/red urgency colour. Short Reel showing the business in action works well.`,
        },
      },
    ],
    hindi_variants: {
      headline_1: `${city} में सबसे अच्छा ${btype}`,
      headline_2: `${name} — भरोसेमंद और किफायती`,
      primary_text: `क्या आप ${city} में अच्छा ${btype} ढूंढ रहे हैं? ${name} आपकी मदद के लिए यहाँ है! हमसे आज ही संपर्क करें — यह बिल्कुल मुफ़्त है। 👇`,
    },
    expected_outcomes: {
      impressions_monthly: `${Math.round(budgetRupees * 30 * 8).toLocaleString("en-IN")} — ${Math.round(budgetRupees * 30 * 14).toLocaleString("en-IN")}`,
      clicks_monthly: `${Math.round(budgetRupees * 30 / 18).toLocaleString("en-IN")} — ${Math.round(budgetRupees * 30 / 10).toLocaleString("en-IN")}`,
      leads_per_month: leadsPerMonth,
      cost_per_lead_estimate: cpl,
      roas_estimate: goal === "sales" ? 3.2 : 0,
      breakeven_leads: Math.ceil(budgetRupees * 30 / 2000),
    },
    india_intelligence: {
      city_insight: `${city} is a price-conscious market where word-of-mouth and local reputation matter greatly. Use vernacular (Hindi) creative alongside English to maximise reach. WhatsApp CTA performs 30–40% better than web forms here.`,
      competitor_note: `Most local ${btype} businesses in ${city} run generic ads without strong CTAs or social proof. Differentiate with specific reviews, before/after content, and a clear ₹ value proposition.`,
      festival_note: null,
      quick_wins: [
        "Add Google Business Profile and link to your ads — improves local ad ranking",
        "Enable call extensions immediately — 60% of conversions in Tier 2 cities happen via phone",
        "Create a WhatsApp Business link and use it as the landing destination",
        "Film a 15-second Reel showing your business in action — outperforms static images by 3x on Meta",
      ],
    },
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
