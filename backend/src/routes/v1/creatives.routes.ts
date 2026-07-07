import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { creditService } from "../../services/CreditService";
import { NotFoundError } from "../../lib/errors";
import { success } from "../../lib/response";
import { paginate } from "../../lib/helpers";
import { logger } from "../../lib/logger";
import { config } from "../../config";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: config.ai.openaiKey });

export const creativeRouter = Router();
creativeRouter.use(authenticate);

// ── List creatives ─────────────────────────────────────────────────────────────
creativeRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const { skip, take } = paginate(page, limit);

    const [creatives, total] = await Promise.all([
      prisma.creative.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { business: { select: { id: true, name: true } } },
      }),
      prisma.creative.count({ where: { userId, deletedAt: null } }),
    ]);

    return success(res, creatives, 200, { page, limit, total });
  } catch (err) {
    next(err);
  }
});

// ── Generate creative synchronously ───────────────────────────────────────────
creativeRouter.post("/", aiRateLimit, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const {
      businessId,
      platform = "meta",
      format = "feed",
      style = "professional",
      goal = "leads",
      campaignId,
    } = req.body;

    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: userId, deletedAt: null },
    });
    if (!business) throw new NotFoundError("Business");

    await creditService.checkAndDeduct(userId, "creative_generate");

    // ── Step 1: Generate ad copy + image prompt via GPT ──────────────────────
    const formatLabel =
      format === "story" ? "Instagram Story (9:16 vertical)"
      : format === "square" ? "Square (1:1 feed post)"
      : format === "banner" ? "Horizontal banner (728x90)"
      : "Social media feed (1:1 square)";

    const copyResult = await Promise.race([
      aiRouter.complete({
        task: "creative_brief",
        messages: [
          {
            role: "system",
            content: `You are a senior Indian ad creative director. You create high-converting ad copy for Indian SMBs.
Be specific to the business. Use emotional hooks. Include Hindi/Hinglish where it adds authenticity.
Respond ONLY with valid JSON.`,
          },
          {
            role: "user",
            content: `Generate an ad creative for:
Business: ${business.name}
Type: ${business.businessType ?? "business"}
City: ${business.city ?? "India"}
Goal: ${goal}
Platform: ${platform === "google" ? "Google Display Ads" : "Meta (Facebook/Instagram)"}
Format: ${formatLabel}
Style: ${style}

Return this JSON:
{
  "title": "short creative title for gallery",
  "headline": "main ad headline (max 35 chars, punchy)",
  "subheadline": "supporting line (max 50 chars)",
  "body_copy": "2-3 sentence ad body copy",
  "cta": "CTA button text (max 20 chars)",
  "badge_text": "optional badge like '50% OFF' or 'New Launch' or null",
  "color_palette": {
    "primary": "#hex — dominant brand color",
    "secondary": "#hex — accent color",
    "text_on_primary": "#ffffff or #000000"
  },
  "image_prompt": "Detailed DALL-E 3 prompt for background image. Must NOT contain any text or words. Should show a professional, bright, high-quality scene relevant to ${business.businessType ?? "business"} in India. Include lighting and composition guidance. End with: photorealistic, commercial photography, no text, no words, 4K",
  "hindi_headline": "headline in Hindi or Hinglish",
  "visual_concept": "one sentence describing the ad layout idea"
}`,
          },
        ],
        maxTokens: 1200,
        userId,
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("AI timeout")), 20000)),
    ]).catch(() => null);

    let copy: any = null;
    if (copyResult) {
      try { copy = JSON.parse((copyResult as any).content); } catch { copy = null; }
    }

    // Fallback copy
    if (!copy) copy = buildFallbackCopy(business, goal, style);

    // ── Step 2: Generate image via DALL-E 3 ───────────────────────────────────
    let imageUrl: string | null = null;

    if (config.ai.openaiKey) {
      try {
        const dalleSize = format === "story" ? "1024x1792" : "1024x1024";
        const imgRes = await openai.images.generate({
          model: "dall-e-3",
          prompt: copy.image_prompt,
          size: dalleSize as any,
          quality: "standard",
          n: 1,
        });
        imageUrl = imgRes.data[0]?.url ?? null;
        logger.info(`DALL-E 3 image generated for creative: ${imageUrl?.slice(0, 60)}`);
      } catch (imgErr: any) {
        logger.warn(`DALL-E 3 failed: ${imgErr.message} — using gradient fallback`);
      }
    }

    // ── Step 3: Save to DB ────────────────────────────────────────────────────
    const creative = await prisma.creative.create({
      data: {
        businessId,
        userId,
        campaignId: campaignId ?? null,
        type: "image_ad",
        title: copy.title ?? `${business.name} — ${format} Ad`,
        brief: copy.visual_concept ?? "",
        bodyCopy: copy.body_copy,
        visualDirection: copy.visual_concept,
        imagePrompt: copy.image_prompt,
        platform,
        format,
        generatedImageUrls: imageUrl ? [imageUrl] : [],
        aiModelUsed: copyResult ? (copyResult as any).response?.model : "fallback",
        status: "draft",
      },
    });

    return success(res, {
      id: creative.id,
      title: copy.title,
      headline: copy.headline,
      subheadline: copy.subheadline,
      body_copy: copy.body_copy,
      cta: copy.cta,
      badge_text: copy.badge_text ?? null,
      color_palette: copy.color_palette,
      hindi_headline: copy.hindi_headline,
      image_url: imageUrl,
      platform,
      format,
      business_name: business.name,
      city: business.city,
    }, 201);
  } catch (err) {
    next(err);
  }
});

// ── Get creative by ID ─────────────────────────────────────────────────────────
creativeRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const creative = await prisma.creative.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
      include: { business: { select: { id: true, name: true, city: true } } },
    });
    if (!creative) throw new NotFoundError("Creative");
    return success(res, creative);
  } catch (err) {
    next(err);
  }
});

// ── Delete creative ────────────────────────────────────────────────────────────
creativeRouter.delete("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const creative = await prisma.creative.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!creative) throw new NotFoundError("Creative");
    await prisma.creative.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Fallback copy generator ────────────────────────────────────────────────────
function buildFallbackCopy(business: any, goal: string, style: string) {
  const name = business.name ?? "Your Business";
  const city = business.city ?? "India";
  const btype = business.businessType ?? "service";

  const palettes: Record<string, any> = {
    professional: { primary: "#1a1a2e", secondary: "#e94560", text_on_primary: "#ffffff" },
    festive:      { primary: "#ff6b35", secondary: "#f7c948", text_on_primary: "#ffffff" },
    minimal:      { primary: "#f8f9fa", secondary: "#212529", text_on_primary: "#212529" },
    bold:         { primary: "#6c2eb9", secondary: "#f72585", text_on_primary: "#ffffff" },
  };

  const ctaMap: Record<string, string> = {
    leads: "Get Free Quote", calls: "Call Now", bookings: "Book Now",
    sales: "Shop Now", brand_awareness: "Learn More",
  };

  return {
    title: `${name} — ${btype} Ad`,
    headline: `${city}'s Trusted ${btype.slice(0, 20)}`,
    subheadline: `Quality service. Honest pricing.`,
    body_copy: `Looking for the best ${btype} in ${city}? ${name} has served hundreds of happy customers. Get in touch today — it's completely free to enquire!`,
    cta: ctaMap[goal] ?? "Contact Us",
    badge_text: null,
    color_palette: palettes[style] ?? palettes.professional,
    hindi_headline: `${city} में सबसे अच्छा ${btype}`,
    visual_concept: `Clean ${style} ad showcasing ${name}'s services in ${city}`,
    image_prompt: `Professional commercial photography of ${btype} business in India. Bright, modern interior or service in action. No people's faces prominent. Clean, aspirational imagery. No text, no words, photorealistic, 4K.`,
  };
}
