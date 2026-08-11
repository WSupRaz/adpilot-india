import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { creditService } from "../../services/CreditService";
import { success } from "../../lib/response";
import { paginate } from "../../lib/helpers";
import { logger } from "../../lib/logger";

export const competitorRouter = Router();
competitorRouter.use(authenticate);

// ── List analyses ─────────────────────────────────────────────────────────────
competitorRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      prisma.competitorAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip, take,
      }),
      prisma.competitorAnalysis.count({ where: { userId } }),
    ]);
    return success(res, items, 200, { page, limit, total });
  } catch (err) { next(err); }
});

// ── Run competitor analysis ───────────────────────────────────────────────────
competitorRouter.post("/", aiRateLimit, async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    let { competitorUrl, businessId } = req.body;

    if (!competitorUrl || typeof competitorUrl !== "string") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "competitorUrl is required" } });
    }
    if (!businessId || typeof businessId !== "string") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "businessId is required" } });
    }
    if (!competitorUrl.startsWith("http")) competitorUrl = `https://${competitorUrl}`;

    const business = await prisma.business.findFirst({ where: { id: businessId, ownerId: userId } });
    if (!business) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Business not found" } });

    await creditService.checkAndDeduct(userId, "competitor_analyze");

    const scraped = await scrapeCompetitor(competitorUrl).catch((err) => {
      logger.warn(`Competitor scrape failed for ${competitorUrl}: ${err.message}`);
      return null;
    });

    const aiResult = await Promise.race([
      aiRouter.complete({
        task: "competitor_analyze",
        messages: [
          {
            role: "system",
            content: `You are a competitive intelligence expert specialising in Indian SMB digital marketing.
Analyse the competitor data and generate actionable intelligence for the business owner.
Respond ONLY with valid JSON — no markdown fences, no extra text.`,
          },
          {
            role: "user",
            content: buildCompetitorPrompt(business, competitorUrl, scraped),
          },
        ],
        maxTokens: 2500,
        userId,
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("AI timeout")), 30000)),
    ]).catch(() => null);

    let analysis: any = null;
    if (aiResult) {
      try {
        let raw = (aiResult as any).content as string;
        raw = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        analysis = JSON.parse(raw);
      } catch { analysis = null; }
    }

    if (!analysis) analysis = buildFallbackCompetitorAnalysis(competitorUrl, scraped, business.name);

    const competitorName = analysis.competitor_name || extractDomainName(competitorUrl);

    const record = await prisma.competitorAnalysis.create({
      data: {
        userId,
        businessId,
        competitorUrl,
        competitorName,
        status: "complete",
        positioningAnalysis:  analysis.positioning         ?? null,
        keywordOpportunities: analysis.keyword_opportunities ?? null,
        contentGaps:          analysis.content_gaps         ?? null,
        adAngles:             analysis.ad_angles            ?? null,
        swotAnalysis:         analysis.swot                 ?? null,
        marketGaps:           analysis.market_gaps          ?? null,
        estimatedMonthlySpendRange: analysis.estimated_ad_spend ?? null,
        aiModelUsed:  aiResult ? (aiResult as any).response?.model : "fallback",
        creditsUsed:  20,
        completedAt: new Date(),
      },
    });

    return success(res, {
      id: record.id,
      competitorUrl,
      competitorName,
      status: "complete",
      ...analysis,
    }, 201);
  } catch (err) { next(err); }
});

// ── Get by ID ─────────────────────────────────────────────────────────────────
competitorRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const item = await prisma.competitorAnalysis.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Analysis not found" } });

    const data: any = item;
    return success(res, {
      id: item.id,
      competitorUrl: item.competitorUrl,
      competitorName: item.competitorName,
      status: item.status,
      positioning:           data.positioningAnalysis,
      keyword_opportunities: data.keywordOpportunities,
      content_gaps:          data.contentGaps,
      ad_angles:             data.adAngles,
      swot:                  data.swotAnalysis,
      market_gaps:           data.marketGaps,
      estimated_ad_spend:    item.estimatedMonthlySpendRange,
      createdAt: item.createdAt,
    });
  } catch (err) { next(err); }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDomainName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface CompetitorScraped {
  title: string;
  metaDescription: string;
  h1s: string[];
  h2s: string[];
  hasOpenGraph: boolean;
  hasSchema: boolean;
  hasSchema_org: boolean;
  wordCount: number;
  pageSizeKb: number;
  responseTimeMs: number;
  isHttps: boolean;
  statusCode: number;
  phones: string[];
  priceStrings: string[];
  ctaTexts: string[];
}

async function scrapeCompetitor(url: string): Promise<CompetitorScraped> {
  const start = Date.now();
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AdPilot-Bot/1.0)" },
    signal: AbortSignal.timeout(12000),
    redirect: "follow",
  });
  const responseTimeMs = Date.now() - start;
  const html = await res.text();
  const pageSizeKb = Math.round(Buffer.byteLength(html, "utf8") / 1024);

  const get = (re: RegExp) => re.exec(html)?.[1]?.trim() ?? "";
  const title           = get(/<title[^>]*>([^<]{1,200})<\/title>/i);
  const metaDescription = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,500})/i)
                       || get(/<meta[^>]+content=["']([^"']{1,500})["'][^>]+name=["']description["']/i);

  const h1s = [...html.matchAll(/<h1[^>]*>([^<]{1,150})<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const h2s = [...html.matchAll(/<h2[^>]*>([^<]{1,150})<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 8);

  const hasOpenGraph = /property=["']og:/i.test(html);
  const hasSchema    = /application\/ld\+json/i.test(html);
  const hasSchema_org = /schema\.org/i.test(html);

  const wordCount = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter((w) => w.length > 2).length;

  const phones = [...html.matchAll(/(?:\+91[-\s]?)?[6-9]\d{9}/g)].map((m) => m[0]).slice(0, 3);
  const priceStrings = [...html.matchAll(/₹\s*[\d,]+(?:\s*[-–]\s*₹\s*[\d,]+)?/g)].map((m) => m[0]).slice(0, 5);

  const buttonTexts = [...html.matchAll(/<(?:button|a)[^>]*>([^<]{2,40})<\/(?:button|a)>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter((t) => /call|book|enquire|contact|order|buy|sign.?up|get|start|free|demo|trial|consult/i.test(t))
    .slice(0, 5);

  return {
    title, metaDescription, h1s, h2s, hasOpenGraph, hasSchema, hasSchema_org,
    wordCount, pageSizeKb, responseTimeMs, isHttps: url.startsWith("https://"),
    statusCode: res.status, phones, priceStrings, ctaTexts: buttonTexts,
  };
}

function buildCompetitorPrompt(business: any, competitorUrl: string, s: CompetitorScraped | null): string {
  const myBiz = `
Your Client Business: ${business.name}
Business Type: ${business.businessType}
City: ${business.city}, ${business.state}
Description: ${business.description}`;

  const competitorData = s ? `
Competitor URL: ${competitorUrl}
HTTPS: ${s.isHttps}
Response Time: ${s.responseTimeMs}ms
Page Size: ${s.pageSizeKb}KB

Content:
- Title: "${s.title}"
- Meta Description: "${s.metaDescription}"
- H1 Tags: ${s.h1s.slice(0, 3).join(" | ") || "none"}
- H2 Tags: ${s.h2s.slice(0, 5).join(" | ") || "none"}
- Word Count: ~${s.wordCount}
- Price Mentions: ${s.priceStrings.join(", ") || "none found"}
- CTA Buttons: ${s.ctaTexts.join(", ") || "none found"}
- Phone Numbers visible: ${s.phones.length > 0 ? "yes" : "no"}
- Schema Markup: ${s.hasSchema ? "yes" : "no"}
- Open Graph: ${s.hasOpenGraph ? "yes" : "no"}
` : `Competitor URL: ${competitorUrl}\n(Could not fetch website — analyse based on domain name and give general competitive intelligence.)`;

  return `${myBiz}\n${competitorData}

Analyse this competitor vs. my client's business in the Indian SMB context and return ONLY this JSON:
{
  "competitor_name": "brand or domain name",
  "estimated_ad_spend": "₹X,000 – ₹Y,000/month estimate or 'Unable to estimate'",
  "positioning": {
    "summary": "2-3 sentence description of how this competitor positions itself",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "target_audience": "who they seem to target",
    "key_messages": ["their main message 1", "message 2"]
  },
  "swot": {
    "strengths": ["S1", "S2", "S3"],
    "weaknesses": ["W1", "W2", "W3"],
    "opportunities": ["gap in their offering you can exploit 1", "gap 2", "gap 3"],
    "threats": ["threat to your business from them 1", "threat 2"]
  },
  "keyword_opportunities": [
    {
      "keyword": "example keyword in Hindi or English",
      "intent": "commercial|informational|navigational",
      "opportunity": "why this keyword is an opportunity for your client",
      "difficulty": "easy|medium|hard"
    }
  ],
  "ad_angles": [
    {
      "angle": "Short ad angle name",
      "headline": "Sample ad headline (Hindi/Hinglish/English)",
      "why_it_works": "Why this angle beats the competitor for Indian SMB audience"
    }
  ],
  "content_gaps": [
    "Topic or content piece the competitor hasn't covered that you should create"
  ],
  "market_gaps": [
    "Service, price point, or audience segment the competitor misses"
  ],
  "action_plan": [
    "Specific action to take this week to outcompete them"
  ]
}

Generate:
- 5-8 keyword_opportunities
- 3-5 ad_angles
- 4-6 content_gaps
- 3-4 market_gaps
- 3-5 action_plan items
Be specific to Indian digital marketing, local city context, and the business type.`;
}

function buildFallbackCompetitorAnalysis(url: string, s: CompetitorScraped | null, myBizName: string) {
  const domain = extractDomainName(url);
  return {
    competitor_name: domain,
    estimated_ad_spend: "₹10,000 – ₹50,000/month (estimate)",
    positioning: {
      summary: `${domain} appears to target similar customers in your market. Without full analysis, we've generated general competitive guidance based on the business type.`,
      strengths: ["Established online presence", "Active social media", "Website with clear CTA"],
      weaknesses: ["Generic messaging", "Limited Hindi/vernacular content", "No WhatsApp integration visible"],
      target_audience: "Similar to your target customers",
      key_messages: ["Quality service", "Competitive pricing"],
    },
    swot: {
      strengths: ["Online visibility", "Website with contact info"],
      weaknesses: ["No personalised customer journey", "Weak local SEO"],
      opportunities: ["Target underserved localities they ignore", "Offer Hindi-first content", "Add WhatsApp for instant response"],
      threats: ["They may have more reviews", "Possible higher ad budget"],
    },
    keyword_opportunities: [
      { keyword: `${myBizName.split(" ")[0].toLowerCase()} near me`, intent: "commercial", opportunity: "High local intent — target customers ready to buy", difficulty: "medium" },
      { keyword: `best service in your city`, intent: "commercial", opportunity: "Customers comparing options", difficulty: "medium" },
      { keyword: `affordable alternatives`, intent: "commercial", opportunity: "Price-conscious segment the competitor may miss", difficulty: "easy" },
    ],
    ad_angles: [
      { angle: "Speed & Convenience", headline: "5 Minute Response — Call Now", why_it_works: "Indian customers respond strongly to immediacy and accessibility" },
      { angle: "Local Trust", headline: `Trusted by 500+ families in your city`, why_it_works: "Social proof with local flavour beats generic claims" },
      { angle: "Better Value", headline: "Same Quality, Better Price — No Hidden Charges", why_it_works: "Transparent pricing is a key differentiator for Indian SMBs" },
    ],
    content_gaps: [
      "Customer testimonials in Hindi",
      "Video walkthroughs of your service/products",
      "FAQs answering common customer concerns",
      "Behind-the-scenes content building trust",
    ],
    market_gaps: [
      "Vernacular (Hindi) customer support",
      "WhatsApp-based ordering or booking",
      "Early morning / late evening availability",
    ],
    action_plan: [
      "Create a Google Business Profile and collect 10+ reviews this week",
      "Run a ₹500/day test campaign targeting the same locality as this competitor",
      "Add a WhatsApp button to your website for instant customer contact",
    ],
  };
}
