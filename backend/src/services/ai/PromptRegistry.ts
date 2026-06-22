import type { AIMessage } from "./adapters/BaseAdapter";

export type PromptKey =
  | "campaign_generate"
  | "campaign_policy_check"
  | "audit_analyze"
  | "creative_brief"
  | "competitor_analyze"
  | "growth_plan";

interface PromptTemplate {
  version: string;
  buildMessages: (params: Record<string, unknown>) => AIMessage[];
}

const registry: Record<PromptKey, PromptTemplate> = {
  campaign_generate: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are an expert Indian digital marketing strategist with deep knowledge of Google Ads and Meta Ads.
You understand Indian consumer behavior, regional languages, festival seasons, and local business contexts.
Always focus on business outcomes (leads, sales, calls, bookings) — never use jargon the user won't understand.
Respond ONLY with valid JSON matching the specified schema.`,
      },
      {
        role: "user",
        content: `Generate a complete ad campaign for this business:

Business: ${p.businessName}
Type: ${p.businessType}
Location: ${p.city}, ${p.state} (Tier ${p.cityTier} city)
Goal: ${p.goal} — ${p.goalDescription}
Daily Budget: ₹${p.dailyBudgetRupees}
Platforms: ${p.platforms}
${p.festivalContext ? `Festival/Season Context: ${p.festivalContext}` : ""}
${p.seasonalNotes ? `Seasonal Notes: ${p.seasonalNotes}` : ""}
User Language: ${p.language}

Return a JSON object with:
{
  "campaign_name": string,
  "strategy_rationale": string,
  "google": { "ad_groups": [...], "keywords": [...], "negative_keywords": [...], "bidding_strategy": string },
  "meta": { "audience": {...}, "ad_sets": [...] },
  "ads": [...],
  "expected_outcomes": { "leads_per_month": number, "cost_per_lead_estimate": number },
  "india_intelligence_notes": string
}`,
      },
    ],
  },

  campaign_policy_check: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are a Google Ads and Meta Ads policy compliance checker.
Review ad copy for potential policy violations. Be strict but fair.
Return JSON: { "approved": boolean, "issues": [{ "text": string, "policy": string, "severity": "block"|"warning" }] }`,
      },
      {
        role: "user",
        content: `Check this ad copy for policy violations:\n${JSON.stringify(p.adCopy, null, 2)}`,
      },
    ],
  },

  audit_analyze: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are a senior digital marketing consultant specializing in website audits for Indian businesses.
Analyze the provided website data and give actionable recommendations.
Prioritize issues that affect ad performance and lead generation.
Return valid JSON matching the audit_issues schema.`,
      },
      {
        role: "user",
        content: `Audit this website: ${p.url}

Lighthouse data: ${JSON.stringify(p.lighthouseData)}
Crawl findings: ${JSON.stringify(p.crawlData)}

Return JSON with:
{
  "overall_score": number,
  "scores": { "seo": number, "ux": number, "mobile": number, "speed": number, "conversion": number, "trust": number, "ad_readiness": number },
  "issues": [{ "category": string, "severity": string, "title": string, "description": string, "recommendation": string, "impact_score": number, "effort_score": number }]
}`,
      },
    ],
  },

  creative_brief: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are a creative director specializing in Indian digital advertising.
You understand what hooks work in Indian markets, regional sensibilities, and festival-driven emotions.
Generate creative briefs that can be executed by a designer or videographer.`,
      },
      {
        role: "user",
        content: `Generate a creative brief for:
Business: ${p.businessName} (${p.businessType})
Platform: ${p.platform}
Format: ${p.format}
Goal: ${p.goal}
Target Audience: ${p.targetAudience}
Language: ${p.language}
${p.festivalContext ? `Festival: ${p.festivalContext}` : ""}

Return JSON with hooks, body copy, CTAs, visual direction, image prompt, and Hindi variants.`,
      },
    ],
  },

  competitor_analyze: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are a competitive intelligence analyst for Indian digital markets.
Analyse the provided competitor data and identify actionable opportunities.
Focus on keyword gaps, ad angle opportunities, and positioning weaknesses.`,
      },
      {
        role: "user",
        content: `Analyse this competitor for ${p.businessName}:
Competitor URL: ${p.competitorUrl}
Meta Ad Library data: ${JSON.stringify(p.metaAds)}
Organic keywords: ${JSON.stringify(p.organicKeywords)}

Return a full SWOT analysis, keyword opportunities, content gaps, and ad angle recommendations.`,
      },
    ],
  },

  growth_plan: {
    version: "1.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are an AI growth manager for Indian SMBs.
Given a business goal, create a complete multi-channel growth plan with realistic outcome predictions.
Be specific, actionable, and India-aware (festivals, WhatsApp, local language).`,
      },
      {
        role: "user",
        content: `Create a growth plan:
Business: ${p.businessName} (${p.businessType}) in ${p.city}
Goal: ${p.goalDescription}
Budget: ₹${p.dailyBudgetRupees}/day over ${p.timeframeDays} days
Current situation: ${p.currentSituation}
${p.festivalContext ? `Upcoming events: ${p.festivalContext}` : ""}

Return JSON with recommended channels, budget allocation, week-by-week plan, and predicted outcomes.`,
      },
    ],
  },
};

export class PromptRegistry {
  build(key: PromptKey, params: Record<string, unknown>): AIMessage[] {
    const template = registry[key];
    if (!template) throw new Error(`Unknown prompt key: ${key}`);
    return template.buildMessages(params);
  }

  getVersion(key: PromptKey): string {
    return registry[key]?.version ?? "unknown";
  }
}

export const promptRegistry = new PromptRegistry();
