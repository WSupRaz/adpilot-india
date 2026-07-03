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
    version: "2.0",
    buildMessages: (p) => [
      {
        role: "system",
        content: `You are a senior Indian digital marketing strategist at a top performance agency.
You have deep expertise in Google Ads and Meta Ads for Indian SMBs across Tier 1, 2, and 3 cities.
You understand regional languages, festival seasonality, caste/community nuances, income demographics, and hyperlocal targeting.
Your output is used directly by business owners who trust it to spend their money wisely.
Be specific, opinionated, and data-driven. Never give generic advice.
Respond ONLY with valid JSON — no markdown, no explanation, just the JSON object.`,
      },
      {
        role: "user",
        content: `Create a complete, professional ad campaign strategy for:

BUSINESS: ${p.businessName}
TYPE: ${p.businessType}
LOCATION: ${p.city}, ${p.state} (Tier-${p.cityTier} market)
GOAL: ${p.goal} — "${p.goalDescription}"
DAILY BUDGET: ₹${p.dailyBudgetRupees}/day
PLATFORMS: ${p.platforms}
LANGUAGE PREFERENCE: ${p.language}
${p.festivalContext ? `FESTIVAL/SEASON: ${p.festivalContext}` : ""}
${p.seasonalNotes ? `SEASONAL CONTEXT: ${p.seasonalNotes}` : ""}

Return this exact JSON structure (all fields required):
{
  "campaign_name": "string — specific, not generic",
  "strategy_rationale": "2-3 sentences explaining WHY this strategy, specific to their city and business type",
  "budget_allocation": {
    "google_percent": number,
    "meta_percent": number,
    "reasoning": "string"
  },
  "google": {
    "bidding_strategy": "string — specific strategy name + why",
    "match_types": { "broad": number, "phrase": number, "exact": number },
    "keywords": ["array of 10-15 specific keywords including Hindi/regional variants"],
    "negative_keywords": ["array of 8-10 negatives"],
    "ad_groups": [
      { "name": "string", "theme": "string", "keywords": ["3-5 keywords"], "estimated_cpc": "₹X-Y" }
    ],
    "extensions": ["sitelink texts", "callout texts", "call extension: true/false"],
    "device_split": { "mobile_percent": number, "desktop_percent": number, "reasoning": "string" },
    "day_parting": { "peak_hours": ["9am-12pm", "7pm-10pm"], "low_hours": ["2am-6am"], "reasoning": "string" }
  },
  "meta": {
    "campaign_objective": "string",
    "ad_sets": [
      {
        "name": "string",
        "audience": {
          "age_min": number,
          "age_max": number,
          "gender": "ALL | MALE | FEMALE",
          "locations": ["city names"],
          "radius_km": number,
          "interests": ["specific Meta interest categories"],
          "behaviors": ["specific Meta behaviors"],
          "income_segment": "Top 10% | Top 25% | Middle income | All",
          "estimated_reach": "X,000 — Y,000 people",
          "language": ["Hindi", "English"]
        },
        "placement": ["Feed", "Stories", "Reels"],
        "budget_percent": number
      }
    ]
  },
  "audience_segments": [
    {
      "name": "string — give a persona name like 'Working Mothers 28-40'",
      "size_estimate": "X,000 — Y,000 in ${p.city}",
      "description": "string — who they are, what they want",
      "pain_point": "string — specific problem this ad solves for them",
      "targeting_approach": "string — how to reach them",
      "best_platform": "Google | Meta | Both",
      "estimated_cpa": "₹X"
    }
  ],
  "ab_variants": [
    {
      "variant": "A",
      "angle": "Value / Price",
      "hypothesis": "string — what this tests and why it might win",
      "google_ad": {
        "headline_1": "string (max 30 chars)",
        "headline_2": "string (max 30 chars)",
        "headline_3": "string (max 30 chars)",
        "description_1": "string (max 90 chars)",
        "description_2": "string (max 90 chars)",
        "display_url": "string"
      },
      "meta_ad": {
        "primary_text": "string (2-3 sentences, conversational)",
        "headline": "string (max 40 chars)",
        "cta_button": "LEARN_MORE | GET_QUOTE | BOOK_NOW | SHOP_NOW | CALL_NOW | SIGN_UP",
        "visual_direction": "string — describe what the image/video should show"
      }
    },
    {
      "variant": "B",
      "angle": "Trust / Social Proof",
      "hypothesis": "string",
      "google_ad": { "headline_1": "string", "headline_2": "string", "headline_3": "string", "description_1": "string", "description_2": "string", "display_url": "string" },
      "meta_ad": { "primary_text": "string", "headline": "string", "cta_button": "string", "visual_direction": "string" }
    },
    {
      "variant": "C",
      "angle": "Urgency / Local",
      "hypothesis": "string",
      "google_ad": { "headline_1": "string", "headline_2": "string", "headline_3": "string", "description_1": "string", "description_2": "string", "display_url": "string" },
      "meta_ad": { "primary_text": "string", "headline": "string", "cta_button": "string", "visual_direction": "string" }
    }
  ],
  "hindi_variants": {
    "headline_1": "string — best headline in Hindi/Hinglish",
    "headline_2": "string",
    "primary_text": "string — Meta primary text in Hindi/Hinglish"
  },
  "expected_outcomes": {
    "impressions_monthly": "X,000 — Y,000",
    "clicks_monthly": "X,000 — Y,000",
    "leads_per_month": number,
    "cost_per_lead_estimate": number,
    "roas_estimate": number,
    "breakeven_leads": number
  },
  "india_intelligence": {
    "city_insight": "string — specific to ${p.city} market",
    "competitor_note": "string — what competitors likely do, how to differentiate",
    "festival_note": "string or null",
    "quick_wins": ["3-4 specific actions to take in the first 7 days"]
  }
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
