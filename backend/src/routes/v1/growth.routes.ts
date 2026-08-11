import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { creditService } from "../../services/CreditService";
import { success } from "../../lib/response";
import { paginate } from "../../lib/helpers";

export const growthRouter = Router();
growthRouter.use(authenticate);

// ── List plans ────────────────────────────────────────────────────────────────
growthRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const { skip, take } = paginate(page, limit);

    const [plans, total] = await Promise.all([
      prisma.growthPlan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip, take,
      }),
      prisma.growthPlan.count({ where: { userId } }),
    ]);
    return success(res, plans, 200, { page, limit, total });
  } catch (err) { next(err); }
});

// ── Generate growth plan ──────────────────────────────────────────────────────
growthRouter.post("/", aiRateLimit, async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const { businessId, goalDescription, goalType, goalQuantity, goalTimeframe, availableBudgetPaise } = req.body;

    if (!businessId || !goalDescription) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "businessId and goalDescription are required" } });
    }

    const business = await prisma.business.findFirst({ where: { id: businessId, ownerId: userId } });
    if (!business) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Business not found" } });

    await creditService.checkAndDeduct(userId, "growth_plan");

    const aiResult = await Promise.race([
      aiRouter.complete({
        task: "growth_plan",
        messages: [
          {
            role: "system",
            content: `You are India's top digital marketing growth strategist for small businesses.
You understand the Indian SMB market deeply — Tier 1/2/3 cities, festivals, WhatsApp-first behaviour, local SEO, Meta and Google Ads for Indian audiences.
Generate specific, actionable, budget-aware growth plans. Respond ONLY with valid JSON.`,
          },
          {
            role: "user",
            content: buildGrowthPrompt(business, goalDescription, goalType, goalQuantity, goalTimeframe, availableBudgetPaise),
          },
        ],
        maxTokens: 2800,
        userId,
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("AI timeout")), 35000)),
    ]).catch(() => null);

    let plan: any = null;
    if (aiResult) {
      try {
        let raw = (aiResult as any).content as string;
        raw = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        plan = JSON.parse(raw);
      } catch { plan = null; }
    }

    const budgetRs = availableBudgetPaise ? Math.round(availableBudgetPaise / 100) : null;
    if (!plan) plan = buildFallbackGrowthPlan(business, goalDescription, goalType, budgetRs, goalTimeframe);

    const record = await prisma.growthPlan.create({
      data: {
        userId,
        businessId,
        goalDescription,
        goalType: goalType ?? null,
        goalQuantity:         goalQuantity         ? Number(goalQuantity)         : null,
        goalTimeframe:        goalTimeframe         ? Number(goalTimeframe)        : null,
        availableBudgetPaise: availableBudgetPaise  ? Number(availableBudgetPaise) : null,
        recommendedChannels:  plan.channels         ?? null,
        budgetAllocation:     plan.budget_breakdown ?? null,
        adStrategy:           plan.ad_strategy      ?? null,
        creativeStrategy:     plan.creative_strategy ?? null,
        followupStrategy:     plan.followup_strategy ?? null,
        optimizationPlan:     plan.optimization     ?? null,
        expectedLeads:        plan.expected_leads    ? Number(plan.expected_leads) : null,
        expectedCostPaise:    plan.expected_cost_rs  ? Math.round(Number(plan.expected_cost_rs) * 100) : null,
        expectedTimelineDays: goalTimeframe          ? Number(goalTimeframe)       : null,
        status: "draft",
        aiModelUsed: aiResult ? (aiResult as any).response?.model : "fallback",
        creditsUsed: 20,
      },
    });

    return success(res, {
      id: record.id,
      businessId,
      goalDescription,
      status: "draft",
      ...plan,
    }, 201);
  } catch (err) { next(err); }
});

// ── Get by ID ─────────────────────────────────────────────────────────────────
growthRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const plan = await prisma.growthPlan.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!plan) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Plan not found" } });

    const p: any = plan;
    return success(res, {
      id: plan.id,
      businessId: plan.businessId,
      goalDescription: plan.goalDescription,
      goalType: plan.goalType,
      status: plan.status,
      channels:          p.recommendedChannels,
      budget_breakdown:  p.budgetAllocation,
      ad_strategy:       p.adStrategy,
      creative_strategy: p.creativeStrategy,
      followup_strategy: p.followupStrategy,
      optimization:      p.optimizationPlan,
      expected_leads:    plan.expectedLeads,
      expected_cost_rs:  plan.expectedCostPaise ? Math.round(plan.expectedCostPaise / 100) : null,
      createdAt: plan.createdAt,
    });
  } catch (err) { next(err); }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildGrowthPrompt(
  business: any,
  goalDescription: string,
  goalType: string | undefined,
  goalQuantity: number | undefined,
  goalTimeframe: number | undefined,
  availableBudgetPaise: number | undefined
): string {
  const budgetRs = availableBudgetPaise ? Math.round(availableBudgetPaise / 100) : null;
  const timeframeDays = goalTimeframe ?? 30;

  return `Business Profile:
Name: ${business.name}
Type: ${business.businessType} / ${business.industryCategory ?? "general"}
City: ${business.city}, ${business.state} (Tier ${business.cityTier ?? 2})
Description: ${business.description}
Monthly Ad Budget (typical): ₹${business.avgMonthlyBudget ? Math.round(business.avgMonthlyBudget / 100) : "not set"}

Growth Goal:
Goal: "${goalDescription}"
Type: ${goalType ?? "not specified"}
Quantity target: ${goalQuantity ? `${goalQuantity} ${goalType ?? "results"}` : "not specified"}
Timeframe: ${timeframeDays} days
Available budget for this plan: ${budgetRs ? `₹${budgetRs}` : "not specified — recommend an appropriate budget"}

Generate a complete, actionable Indian SMB growth plan and return ONLY this JSON:
{
  "summary": "2-3 sentence executive summary of the growth plan",
  "expected_leads": <number>,
  "expected_cost_rs": <total spend in rupees>,
  "confidence": "high|medium|low",
  "channels": [
    {
      "name": "Meta Ads|Google Ads|WhatsApp|SEO|Google Business|Influencer|Offline",
      "priority": "primary|secondary|optional",
      "allocation_percent": <0-100>,
      "budget_rs_monthly": <number>,
      "why": "Why this channel for this business + city tier",
      "expected_result": "Specific metric expected from this channel"
    }
  ],
  "budget_breakdown": {
    "total_rs": <number>,
    "weekly": [
      { "week": 1, "focus": "what to do this week", "spend_rs": <number>, "actions": ["action 1", "action 2"] }
    ]
  },
  "ad_strategy": {
    "meta": {
      "objective": "LEAD_GENERATION|TRAFFIC|CONVERSIONS|REACH",
      "audience": "describe the Facebook/Instagram targeting",
      "creative_type": "image|video|carousel",
      "sample_headline": "Sample Hindi/Hinglish/English headline",
      "sample_cta": "CTA text"
    },
    "google": {
      "campaign_type": "Search|PMax|Local",
      "top_keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
      "match_type": "Exact+Phrase",
      "negative_keywords": ["neg1", "neg2"]
    }
  },
  "creative_strategy": {
    "content_pillars": ["theme 1", "theme 2", "theme 3"],
    "formats": ["Reel", "Story", "Static post"],
    "tone": "Hindi-first|Hinglish|English",
    "hooks": ["Hook line 1 for Indian audience", "Hook 2", "Hook 3"]
  },
  "followup_strategy": {
    "whatsapp": "How to follow up leads on WhatsApp",
    "response_time_target": "Within X minutes/hours",
    "script": "Short follow-up message template in Hindi/Hinglish"
  },
  "optimization": {
    "week_2_review": "What to check and optimize in week 2",
    "kpis": ["KPI 1 with target", "KPI 2", "KPI 3"],
    "kill_signal": "When to pause an ad and why"
  },
  "india_intelligence": {
    "festival_alert": "Any upcoming festival to plan around",
    "city_insight": "Specific insight for ${business.city}",
    "quick_win": "One thing to do TODAY that costs nothing"
  }
}

Make the plan practical for an Indian SMB owner with limited time. Include Hindi/Hinglish examples where relevant.
Timeframe: ${timeframeDays} days. Be realistic about results.`;
}

function buildFallbackGrowthPlan(business: any, goalDescription: string, goalType: string | undefined, budgetRs: number | null, timeframeDays: number | undefined) {
  const days = timeframeDays ?? 30;
  const budget = budgetRs ?? 15000;
  const metaBudget = Math.round(budget * 0.5);
  const googleBudget = Math.round(budget * 0.3);
  const otherBudget = budget - metaBudget - googleBudget;

  return {
    summary: `A ${days}-day growth plan for ${business.name} focused on ${goalType ?? "results"} in ${business.city}. We recommend a Meta-first approach for awareness and Google Search for capturing high-intent customers. Total budget: ₹${budget.toLocaleString("en-IN")}.`,
    expected_leads: Math.round(budget / 400),
    expected_cost_rs: budget,
    confidence: "medium",
    channels: [
      { name: "Meta Ads", priority: "primary", allocation_percent: 50, budget_rs_monthly: metaBudget, why: "Highest reach for Indian SMBs in Tier 2 cities; Facebook and Instagram together reach 95%+ of your target audience.", expected_result: `${Math.round(metaBudget / 250)} leads from Meta` },
      { name: "Google Ads", priority: "secondary", allocation_percent: 30, budget_rs_monthly: googleBudget, why: "Capture customers actively searching for your service. High intent = higher conversion rate.", expected_result: `${Math.round(googleBudget / 300)} leads from Google` },
      { name: "Google Business", priority: "secondary", allocation_percent: 10, budget_rs_monthly: otherBudget, why: "Free local listing drives 'near me' searches — often the highest quality leads.", expected_result: "5-15 calls/month from local search" },
      { name: "WhatsApp", priority: "optional", allocation_percent: 10, budget_rs_monthly: 0, why: "Follow up leads instantly on WhatsApp — 90%+ open rate vs 20% for email.", expected_result: "30-50% lead conversion improvement" },
    ],
    budget_breakdown: {
      total_rs: budget,
      weekly: [
        { week: 1, focus: "Setup and launch", spend_rs: Math.round(budget * 0.2), actions: ["Set up Facebook Business Manager", "Create Google Ads account", "Design 2 ad creatives", "Launch test campaigns"] },
        { week: 2, focus: "Optimise based on data", spend_rs: Math.round(budget * 0.25), actions: ["Pause underperforming ads", "Double budget on best performer", "A/B test second creative"] },
        { week: 3, focus: "Scale winners", spend_rs: Math.round(budget * 0.3), actions: ["Scale winning ad sets by 20%", "Add retargeting audience", "Launch Google Search ads"] },
        { week: 4, focus: "Harvest and plan next month", spend_rs: Math.round(budget * 0.25), actions: ["Collect testimonials from new customers", "Plan next month's campaign", "Review cost per lead"] },
      ],
    },
    ad_strategy: {
      meta: { objective: goalType === "leads" ? "LEAD_GENERATION" : "CONVERSIONS", audience: `${business.city} area, relevant age group, interests related to ${business.businessType}`, creative_type: "image", sample_headline: `${business.city} का सबसे भरोसेमंद ${business.name}`, sample_cta: "अभी Call करें" },
      google: { campaign_type: "Search", top_keywords: [`${business.businessType} ${business.city}`, `best ${business.businessType} near me`, `${business.name.toLowerCase()}`, `${business.businessType} in ${business.city}`, `affordable ${business.businessType}`], match_type: "Exact+Phrase", negative_keywords: ["free", "DIY", "how to"] },
    },
    creative_strategy: { content_pillars: ["Customer success stories", "Behind the scenes", "Educational tips"], formats: ["Reel (15-30s)", "Static image", "Story with swipe-up"], tone: "Hinglish", hooks: ["क्या आप भी इस problem से परेशान हैं?", "Sirf ₹X mein get started karein", "1000+ customers ka trust"] },
    followup_strategy: { whatsapp: "Reply to all leads within 5 minutes on WhatsApp with a personalised message mentioning their specific enquiry", response_time_target: "Within 5 minutes during business hours", script: "Namaste! Main [Name] hun ${business.name} se. Aapka enquiry mila. Kya aap abhi baat kar sakte hain? 🙏" },
    optimization: { week_2_review: "Check cost per lead — if over ₹400, pause the ad with lowest CTR and reallocate budget to the winner.", kpis: [`Cost per lead: target < ₹${Math.round(budget / (Math.round(budget / 400) + 1))}`, "CTR: target > 1.5%", "WhatsApp response rate: target > 60%"], kill_signal: "Pause any ad that spends ₹500+ with 0 conversions after 3 days." },
    india_intelligence: { festival_alert: "Plan campaign 2 weeks before any major festival — budgets should increase by 50%.", city_insight: `${business.city} customers prefer WhatsApp contact over forms — add click-to-WhatsApp to all ads.`, quick_win: "Create a Google Business Profile today (free) and ask your best 5 customers for a Google review this week." },
  };
}
