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
      skipImageGeneration = false,
    } = req.body;

    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: userId, deletedAt: null },
    });
    if (!business) throw new NotFoundError("Business");

    await creditService.checkAndDeduct(userId, "creative_generate");

    const btype = business.businessType ?? "business";
    const city  = business.city ?? "India";

    const formatLabel =
      format === "story"  ? "Instagram Story (9:16 vertical, tall)" :
      format === "square" ? "Google Display Square (1:1)" :
      format === "banner" ? "Horizontal display banner (4:1, wide)" :
      "Social media feed post (1:1 square)";

    // ── Step 1: Generate ad copy via AI ───────────────────────────────────────
    const copyResult = await Promise.race([
      aiRouter.complete({
        task: "creative_brief",
        messages: [
          {
            role: "system",
            content: `You are a senior Indian ad creative director at a top performance marketing agency.
You create high-converting, emotionally compelling ad creatives for Indian SMBs.
Be hyper-specific to the business type. Use punchy, benefit-driven language.
Include Hindi/Hinglish naturally where it adds authenticity and trust.
Respond ONLY with valid JSON — no markdown, no code fences, just raw JSON.`,
          },
          {
            role: "user",
            content: `Generate a premium ad creative for:

Business: ${business.name}
Type: ${btype}
City: ${city}
Goal: ${goal}
Platform: ${platform === "google" ? "Google Display Ads" : "Meta (Facebook/Instagram)"}
Format: ${formatLabel}
Visual Style: ${style}

Return EXACTLY this JSON schema:
{
  "title": "short gallery title, 4-6 words",
  "headline": "punchy main headline, MAX 35 chars, use power words",
  "subheadline": "supporting benefit line, MAX 55 chars",
  "body_copy": "2-3 compelling sentences highlighting the business value, mention city for local trust",
  "cta": "action button text, MAX 18 chars",
  "badge_text": "urgent offer badge like '40% OFF', 'Free Demo', 'Limited Slots' — or null",
  "usps": ["benefit 1, max 22 chars", "benefit 2, max 22 chars", "benefit 3, max 22 chars"],
  "color_palette": {
    "primary": "#hex — dominant brand/bg color matching the ${style} style",
    "secondary": "#hex — vibrant accent color for CTA and badges",
    "text_on_primary": "#ffffff or #000000"
  },
  "hindi_headline": "headline in natural Hindi or Hinglish, emotionally resonant",
  "visual_concept": "one sentence describing the visual scene and mood"
}`,
          },
        ],
        maxTokens: 900,
        userId,
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("AI timeout")), 20000)),
    ]).catch(() => null);

    let copy: any = null;
    if (copyResult) {
      try {
        let raw = (copyResult as any).content as string;
        // Strip markdown code fences if model wrapped the JSON
        raw = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        copy = JSON.parse(raw);
      } catch {
        copy = null;
      }
    }

    if (!copy) copy = buildFallbackCopy(business, goal, style);

    // ── Step 2: Generate background image via DALL-E 3 ────────────────────────
    let imageUrl: string | null = null;

    if (!skipImageGeneration && config.ai.openaiKey) {
      const dalleSize = format === "story" ? "1024x1792" : "1024x1024";
      const dallePrompt = buildCinematicDallePrompt(btype, style, city);

      try {
        const imgRes = await openai.images.generate({
          model: "dall-e-3",
          prompt: dallePrompt,
          size: dalleSize as any,
          quality: "hd",
          n: 1,
        });
        imageUrl = imgRes.data[0]?.url ?? null;
        logger.info(`DALL-E 3 image generated: ${imageUrl?.slice(0, 60)}`);
      } catch (imgErr: any) {
        logger.warn(`DALL-E 3 failed: ${imgErr.message} — gradient fallback`);
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
        imagePrompt: buildCinematicDallePrompt(btype, style, city),
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
      usps: Array.isArray(copy.usps) ? copy.usps.slice(0, 3) : [],
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

// ── Cinematic DALL-E 3 prompt builder ─────────────────────────────────────────
function buildCinematicDallePrompt(businessType: string, style: string, city: string): string {
  const bt = businessType.toLowerCase();

  let scene: string;
  if (/restaurant|food|cafe|dhaba|hotel|biryani|pizza|bakery|sweet|tiffin|catering/.test(bt)) {
    scene = "Overhead flat-lay of beautifully styled Indian food — vibrant curry in polished copper bowls, steaming aromatic rice, colorful spices arranged artistically, fresh cilantro garnish, rustic wooden surface, warm restaurant bokeh in background";
  } else if (/gym|fitness|yoga|pilates|crossfit|zumba|aerobic|dance/.test(bt)) {
    scene = "Premium fitness studio bathed in golden morning light — rows of gleaming dumbbells casting long shadows on polished concrete floors, large windows, mirrors reflecting energy, modern equipment, powerful motivational atmosphere";
  } else if (/salon|beauty|spa|hair|nail|makeup|grooming|parlour|skin/.test(bt)) {
    scene = "Elegant luxury beauty salon — Hollywood vanity mirrors with warm round bulb lighting, plush styling chairs in blush and ivory, premium beauty products artfully arranged, rose petals, soft glamorous glow, aspirational";
  } else if (/school|education|coaching|institute|class|tuition|tutor|academy|learning/.test(bt)) {
    scene = "Bright inspiring learning center — neatly organized desk with open textbooks, colorful stationery, a whiteboard with diagrams in background, warm morning sunlight streaming through windows, cheerful motivational atmosphere";
  } else if (/clinic|doctor|medical|health|hospital|dental|physio|therapy|ayurved/.test(bt)) {
    scene = "Clean serene modern medical clinic — white and soft mint green interior, professional healthcare environment, stethoscope on clipboard, plants in reception area, calm reassuring atmosphere, natural light";
  } else if (/jewel|gold|silver|diamond|ornament|ring|necklace/.test(bt)) {
    scene = "Stunning close-up of intricately crafted gold and diamond jewellery displayed on black velvet — gemstones catching studio light from multiple angles, sparkling brilliance, luxury retail photography, opulent and aspirational";
  } else if (/fashion|cloth|boutique|saree|kurti|garment|apparel|wear|dress/.test(bt)) {
    scene = "Premium Indian fashion boutique interior — vibrant ethnic wear and sarees cascading from elegant hangers, rich silk fabrics in jewel tones, warm golden spotlights, polished marble floors, aspirational retail environment";
  } else if (/real estate|property|flat|apartment|villa|builder|construction|home/.test(bt)) {
    scene = "Luxury modern apartment interior — floor-to-ceiling windows with sweeping city skyline view, elegant contemporary furniture, marble floors, warm amber lighting at dusk, aspirational premium home lifestyle";
  } else if (/car|auto|vehicle|bike|motorcycle|scooter|showroom/.test(bt)) {
    scene = "Sleek premium car gleaming under dramatic studio lighting in a modern showroom — reflections on polished hood, low angle cinematic shot, aspirational automotive photography, powerful and desirable";
  } else if (/tech|software|IT|digital|app|startup|agency|web|mobile/.test(bt)) {
    scene = "Modern tech startup office in India — open collaborative workspace with glass walls, multiple monitors showing colorful dashboards and code, city skyline through panoramic windows, dynamic innovative energy";
  } else if (/travel|tour|holiday|resort|hotel|hospitality/.test(bt)) {
    scene = "Breathtaking travel scene — a stunning heritage Indian palace reflected in still water at golden hour, or a pristine luxury resort infinity pool overlooking misty mountains, aspirational wanderlust photography";
  } else if (/organic|farm|dairy|milk|vegetable|natural|herbal/.test(bt)) {
    scene = "Fresh organic produce arranged on a rustic wooden farmhouse table — colorful vegetables, glass milk bottles, morning dew on leaves, bright natural window light, wholesome farm-fresh lifestyle";
  } else if (/interior|decor|furniture|design|architect/.test(bt)) {
    scene = "Stunning modern interior design showcase — thoughtfully curated living space with designer furniture, textured walls, accent lighting, lush indoor plants, a perfect blend of form and function";
  } else if (/photography|photo|studio|videography|film/.test(bt)) {
    scene = "Professional photography studio — dramatic moody lighting with rim lights and softboxes, lens flares, camera equipment, creative artistic atmosphere, the magic behind the scenes";
  } else {
    scene = `A thriving, welcoming ${businessType} establishment in modern urban India — professional environment, aspirational atmosphere, happy implied customers, clean and polished, conveying trust and quality`;
  }

  const styleEnhancer: Record<string, string> = {
    professional: "clean crisp commercial photography, soft professional lighting, corporate confidence, highly polished and trustworthy",
    festive:      "warm festival bokeh lights in background, marigold flowers, golden Diwali atmosphere, celebratory joy and abundance",
    bold:         "dramatic high-contrast cinematic lighting, rich saturated colors, editorial photography, visually powerful and eye-catching",
    minimal:      "airy minimalist composition, abundant negative space, soft natural window light, Scandinavian-inspired calm and elegance",
  };

  const mod = styleEnhancer[style] ?? styleEnhancer.professional;
  return `${scene}. ${mod}. ${city}, India. Award-winning commercial advertising photography. No text, no words, no letters, no signs with writing, no numbers. Photorealistic, 4K ultra detail, perfect for advertisement background image.`;
}

// ── Fallback copy generator ────────────────────────────────────────────────────
function buildFallbackCopy(business: any, goal: string, style: string) {
  const name  = business.name ?? "Your Business";
  const city  = business.city ?? "India";
  const btype = business.businessType ?? "service";

  const palettes: Record<string, any> = {
    professional: { primary: "#1a1a2e", secondary: "#e94560", text_on_primary: "#ffffff" },
    festive:      { primary: "#c0392b", secondary: "#f7c948", text_on_primary: "#ffffff" },
    minimal:      { primary: "#f8f9fa", secondary: "#212529", text_on_primary: "#212529" },
    bold:         { primary: "#6c2eb9", secondary: "#f72585", text_on_primary: "#ffffff" },
  };

  const ctaMap: Record<string, string> = {
    leads: "Get Free Quote", calls: "Call Now", bookings: "Book Now",
    sales: "Shop Now", brand_awareness: "Learn More",
  };

  return {
    title: `${name} — ${btype} Ad`,
    headline: `${city}'s Best ${btype.slice(0, 18)}`,
    subheadline: "Quality service. Trusted by hundreds.",
    body_copy: `Looking for the best ${btype} in ${city}? ${name} has served 500+ happy customers. Call today — free consultation!`,
    cta: ctaMap[goal] ?? "Contact Us",
    badge_text: goal === "leads" ? "Free Quote" : goal === "sales" ? "Limited Offer" : null,
    usps: ["Trusted by 500+", "Same-day service", "Best price guaranteed"],
    color_palette: palettes[style] ?? palettes.professional,
    hindi_headline: `${city} का सबसे भरोसेमंद ${btype}`,
    visual_concept: `Clean ${style} ad showcasing ${name}'s services in ${city}`,
  };
}
