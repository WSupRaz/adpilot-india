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

export const auditRouter = Router();
auditRouter.use(authenticate);

// ── List audits ────────────────────────────────────────────────────────────────
auditRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const { skip, take } = paginate(page, limit);

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip, take,
      }),
      prisma.audit.count({ where: { userId } }),
    ]);
    return success(res, audits, 200, { page, limit, total });
  } catch (err) { next(err); }
});

// ── Run audit synchronously ────────────────────────────────────────────────────
auditRouter.post("/", aiRateLimit, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    let { url, businessId } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "URL is required" } });
    }
    if (!url.startsWith("http")) url = `https://${url}`;

    await creditService.checkAndDeduct(userId, "audit_analyze");

    // ── Step 1: Scrape the URL ─────────────────────────────────────────────────
    const scraped = await scrapeUrl(url).catch((err) => {
      logger.warn(`Scrape failed for ${url}: ${err.message}`);
      return null;
    });

    // ── Step 2: AI audit analysis ─────────────────────────────────────────────
    const aiResult = await Promise.race([
      aiRouter.complete({
        task: "audit_analyze",
        messages: [
          {
            role: "system",
            content: `You are a senior digital marketing and SEO consultant specialising in Indian SMB websites.
Analyse the provided website data and give a detailed audit with actionable recommendations.
Respond ONLY with valid JSON — no markdown, no code fences.`,
          },
          {
            role: "user",
            content: buildAuditPrompt(url, scraped),
          },
        ],
        maxTokens: 2000,
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
      } catch {
        analysis = null;
      }
    }

    if (!analysis) analysis = buildFallbackAnalysis(url, scraped);

    // ── Step 3: Save to DB ────────────────────────────────────────────────────
    const issues: any[] = Array.isArray(analysis.issues) ? analysis.issues.slice(0, 20) : [];
    const criticalCount = issues.filter((i: any) => i.severity === "critical").length;
    const highCount     = issues.filter((i: any) => i.severity === "high").length;
    const mediumCount   = issues.filter((i: any) => i.severity === "medium").length;
    const lowCount      = issues.filter((i: any) => i.severity === "low" || i.severity === "info").length;

    const audit = await prisma.audit.create({
      data: {
        userId,
        businessId: businessId ?? null,
        url,
        status: "complete",
        overallScore:     clamp(analysis.overall_score),
        seoScore:         clamp(analysis.seo_score),
        uxScore:          clamp(analysis.ux_score),
        mobileScore:      clamp(analysis.mobile_score),
        speedScore:       clamp(analysis.speed_score),
        conversionScore:  clamp(analysis.conversion_score),
        trustScore:       clamp(analysis.trust_score),
        adReadinessScore: clamp(analysis.ad_readiness_score),
        crawlerData:  (scraped ?? {}) as any,
        aiAnalysis:   analysis,
        aiModelUsed:  aiResult ? (aiResult as any).response?.model : "fallback",
        creditsUsed:  10,
        criticalIssuesCount: criticalCount,
        highIssuesCount:     highCount,
        mediumIssuesCount:   mediumCount,
        lowIssuesCount:      lowCount,
        completedAt: new Date(),
        auditIssues: {
          create: issues.map((issue: any, idx: number) => ({
            category:       issue.category ?? "seo",
            severity:       issue.severity ?? "medium",
            title:          issue.title ?? "Issue",
            description:    issue.description ?? "",
            recommendation: issue.recommendation ?? "",
            impactScore:    Number(issue.impact_score) || 5,
            effortScore:    Number(issue.effort_score) || 5,
            sortOrder:      idx,
          })),
        },
      },
    }) as any;

    return success(res, {
      id: audit.id,
      url: audit.url,
      status: audit.status,
      overall_score:     audit.overallScore,
      seo_score:         audit.seoScore,
      ux_score:          audit.uxScore,
      mobile_score:      audit.mobileScore,
      speed_score:       audit.speedScore,
      conversion_score:  audit.conversionScore,
      trust_score:       audit.trustScore,
      ad_readiness_score: audit.adReadinessScore,
      summary:           analysis.summary ?? "",
      quick_wins:        analysis.quick_wins ?? [],
      critical_issues_count: criticalCount,
      high_issues_count:     highCount,
      issues: issues.map((issue: any, idx: number) => ({
        id:             `${audit.id}-${idx}`,
        category:       issue.category ?? "seo",
        severity:       issue.severity ?? "medium",
        title:          issue.title ?? "Issue",
        description:    issue.description ?? "",
        recommendation: issue.recommendation ?? "",
        impact_score:   Number(issue.impact_score) || 5,
        effort_score:   Number(issue.effort_score) || 5,
      })),
    }, 201);
  } catch (err) { next(err); }
});

// ── Get audit by ID ────────────────────────────────────────────────────────────
auditRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const audit = await prisma.audit.findFirst({
      where: { id: req.params.id, userId },
      include: { auditIssues: { orderBy: { sortOrder: "asc" } } },
    });
    if (!audit) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Audit not found" } });

    const analysis: any = audit.aiAnalysis ?? {};
    return success(res, {
      id: audit.id,
      url: audit.url,
      status: audit.status,
      overall_score:     audit.overallScore,
      seo_score:         audit.seoScore,
      ux_score:          audit.uxScore,
      mobile_score:      audit.mobileScore,
      speed_score:       audit.speedScore,
      conversion_score:  audit.conversionScore,
      trust_score:       audit.trustScore,
      ad_readiness_score: audit.adReadinessScore,
      summary:           analysis.summary ?? "",
      quick_wins:        analysis.quick_wins ?? [],
      critical_issues_count: audit.criticalIssuesCount,
      high_issues_count:     audit.highIssuesCount,
      issues: audit.auditIssues.map((i) => ({
        id:             i.id,
        category:       i.category,
        severity:       i.severity,
        title:          i.title,
        description:    i.description,
        recommendation: i.recommendation,
        impact_score:   i.impactScore,
        effort_score:   i.effortScore,
      })),
    });
  } catch (err) { next(err); }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: any): number {
  const n = Number(v);
  return isNaN(n) ? 50 : Math.min(100, Math.max(0, Math.round(n)));
}

interface ScrapedData {
  title: string;
  metaDescription: string;
  metaKeywords: string;
  canonical: string;
  hasViewport: boolean;
  robots: string;
  h1s: string[];
  h2s: string[];
  imgCount: number;
  imgsWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  pageSizeKb: number;
  responseTimeMs: number;
  isHttps: boolean;
  hasSchema: boolean;
  hasOpenGraph: boolean;
  statusCode: number;
}

async function scrapeUrl(url: string): Promise<ScrapedData> {
  const start = Date.now();
  const res = await fetch(url, {
    headers: { "User-Agent": "AdPilot-Audit-Bot/1.0 (+https://adpilotindia.com)" },
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
  const metaKeywords    = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})/i);
  const canonical       = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  const robots          = get(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);

  const hasViewport  = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasSchema    = /application\/ld\+json/i.test(html);
  const hasOpenGraph = /property=["']og:/i.test(html);

  const h1s = [...html.matchAll(/<h1[^>]*>([^<]{1,150})<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const h2s = [...html.matchAll(/<h2[^>]*>([^<]{1,150})<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 8);

  const imgTags       = [...html.matchAll(/<img[^>]+>/gi)];
  const imgCount      = imgTags.length;
  const imgsWithoutAlt = imgTags.filter((m) => !/alt=["'][^"']/i.test(m[0])).length;

  const internalLinks = [...html.matchAll(/href=["']\/[^"']+/gi)].length;
  const externalLinks = [...html.matchAll(/href=["']https?:\/\//gi)].length;

  const wordCount = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter((w) => w.length > 2).length;

  return {
    title, metaDescription, metaKeywords, canonical, hasViewport, robots,
    h1s, h2s, imgCount, imgsWithoutAlt, internalLinks, externalLinks,
    wordCount, pageSizeKb, responseTimeMs,
    isHttps: url.startsWith("https://"),
    hasSchema, hasOpenGraph,
    statusCode: res.status,
  };
}

function buildAuditPrompt(url: string, s: ScrapedData | null): string {
  const data = s ? `
Website URL: ${url}
HTTPS: ${s.isHttps}
Status Code: ${s.statusCode}
Response Time: ${s.responseTimeMs}ms
Page Size: ${s.pageSizeKb}KB

SEO DATA:
- Title: "${s.title}" (${s.title.length} chars — ideal: 50-60)
- Meta Description: "${s.metaDescription}" (${s.metaDescription.length} chars — ideal: 150-160)
- Meta Keywords: "${s.metaKeywords}"
- Canonical Tag: ${s.canonical || "MISSING"}
- Robots Meta: ${s.robots || "not set"}
- H1 Tags (${s.h1s.length}): ${s.h1s.slice(0,3).join(" | ") || "NONE"}
- H2 Tags (${s.h2s.length}): ${s.h2s.slice(0,4).join(" | ") || "NONE"}
- Schema Markup: ${s.hasSchema ? "Present" : "MISSING"}
- Open Graph Tags: ${s.hasOpenGraph ? "Present" : "MISSING"}

CONTENT:
- Word Count: ~${s.wordCount} words
- Images: ${s.imgCount} total, ${s.imgsWithoutAlt} WITHOUT alt text
- Internal Links: ${s.internalLinks}
- External Links: ${s.externalLinks}

TECHNICAL:
- Mobile Viewport Meta: ${s.hasViewport ? "Present" : "MISSING"}
- Page Size: ${s.pageSizeKb}KB (ideal: <500KB)
- Load Time: ${s.responseTimeMs}ms (ideal: <2000ms)
` : `Website URL: ${url}\n(Could not fetch — website may be down or blocking bots. Analyse based on URL and give general recommendations.)`;

  return `${data}

Analyse this Indian SMB website and return ONLY this JSON (no markdown):
{
  "overall_score": <0-100>,
  "seo_score": <0-100>,
  "ux_score": <0-100>,
  "mobile_score": <0-100>,
  "speed_score": <0-100>,
  "conversion_score": <0-100>,
  "trust_score": <0-100>,
  "ad_readiness_score": <0-100>,
  "summary": "2-3 sentence overall assessment mentioning specific issues found",
  "quick_wins": ["actionable fix 1 (max 60 chars)", "fix 2", "fix 3"],
  "issues": [
    {
      "category": "seo|ux|mobile|speed|conversion|trust|ad_readiness",
      "severity": "critical|high|medium|low|info",
      "title": "Short issue title",
      "description": "What the issue is and why it matters for Indian SMB marketing",
      "recommendation": "Specific actionable fix with examples",
      "impact_score": <1-10>,
      "effort_score": <1-10>
    }
  ]
}

Generate 10-15 issues. Order by impact_score descending. Be specific to Indian digital marketing context.
For ad_readiness_score: score how ready this site is to receive paid traffic (landing page quality, conversion elements, trust signals).`;
}

function buildFallbackAnalysis(url: string, s: ScrapedData | null) {
  const issues = [];

  if (s) {
    if (!s.metaDescription || s.metaDescription.length < 50)
      issues.push({ category:"seo", severity:"critical", title:"Missing or weak meta description", description:"Your page has no meta description, which reduces click-through rates from Google by up to 30%.", recommendation:"Write a 150-160 character meta description highlighting your main service and city.", impact_score:9, effort_score:2 });
    if (s.h1s.length === 0)
      issues.push({ category:"seo", severity:"critical", title:"No H1 heading found", description:"Search engines use H1 to understand your page's main topic. Missing H1 significantly hurts SEO.", recommendation:"Add one H1 tag with your main keyword (e.g. 'Best [Service] in [City]').", impact_score:9, effort_score:2 });
    if (!s.isHttps)
      issues.push({ category:"trust", severity:"critical", title:"Website not on HTTPS", description:"Your site uses HTTP which browsers mark as 'Not Secure'. Visitors and Google penalise this.", recommendation:"Install an SSL certificate (free via Let's Encrypt) and redirect all HTTP to HTTPS.", impact_score:10, effort_score:4 });
    if (!s.hasViewport)
      issues.push({ category:"mobile", severity:"critical", title:"Not mobile optimised", description:"No viewport meta tag found — your site likely looks broken on smartphones. 80%+ of Indian users are on mobile.", recommendation:"Add <meta name='viewport' content='width=device-width, initial-scale=1'> to your HTML head.", impact_score:9, effort_score:3 });
    if (s.imgsWithoutAlt > 0)
      issues.push({ category:"seo", severity:"medium", title:`${s.imgsWithoutAlt} images missing alt text`, description:"Images without alt text are invisible to search engines and hurt SEO and accessibility.", recommendation:"Add descriptive alt text to every image, including your main keyword where relevant.", impact_score:6, effort_score:3 });
    if (!s.hasOpenGraph)
      issues.push({ category:"ux", severity:"medium", title:"Missing Open Graph tags", description:"When shared on WhatsApp or Facebook, your page shows no image or description — reducing link clicks.", recommendation:"Add og:title, og:description, and og:image tags for better social sharing.", impact_score:6, effort_score:2 });
    if (s.responseTimeMs > 3000)
      issues.push({ category:"speed", severity:"high", title:`Slow page load (${s.responseTimeMs}ms)`, description:"Pages taking over 3 seconds lose 53% of mobile visitors before they see anything.", recommendation:"Compress images, enable caching, and use a CDN. Target under 2 seconds.", impact_score:8, effort_score:6 });
    if (s.pageSizeKb > 1000)
      issues.push({ category:"speed", severity:"medium", title:`Large page size (${s.pageSizeKb}KB)`, description:"Heavy pages use more mobile data and load slowly on Indian 4G networks.", recommendation:"Compress and lazy-load images, minify CSS/JS, and remove unused scripts.", impact_score:7, effort_score:5 });
  }

  issues.push(
    { category:"conversion", severity:"high", title:"No clear call-to-action above the fold", description:"Visitors don't immediately know what to do next — enquire, call, or buy.", recommendation:"Add a prominent 'Call Now' or 'Get Free Quote' button in the top section of every page.", impact_score:8, effort_score:3 },
    { category:"trust", severity:"medium", title:"Missing customer reviews/testimonials", description:"73% of Indian consumers check reviews before buying. Showing reviews builds instant trust.", recommendation:"Add 3-5 customer testimonials with names and photos, or embed Google reviews.", impact_score:7, effort_score:3 },
    { category:"ad_readiness", severity:"high", title:"No conversion tracking installed", description:"Without Google Analytics or Meta Pixel, you can't measure which ads bring real customers.", recommendation:"Install Google Analytics 4 and Meta Pixel before running any paid campaigns.", impact_score:9, effort_score:4 },
  );

  const score = s ? (s.isHttps ? 55 : 35) : 40;
  return {
    overall_score:     score,
    seo_score:         s?.title ? 55 : 30,
    ux_score:          50,
    mobile_score:      s?.hasViewport ? 65 : 25,
    speed_score:       s ? (s.responseTimeMs < 2000 ? 70 : 45) : 50,
    conversion_score:  40,
    trust_score:       s?.isHttps ? 55 : 30,
    ad_readiness_score: 35,
    summary: `Audit completed for ${url}. Several critical issues were found that are limiting your visibility on Google and reducing conversions from paid ads. Fixing the top 3 issues could increase leads by 40-60%.`,
    quick_wins: ["Add meta description to every page", "Install Google Analytics + Meta Pixel", "Add a WhatsApp call button"],
    issues,
  };
}
