"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CampaignStrategyPanelProps {
  strategy: Record<string, unknown>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted text-sm font-semibold text-left"
      >
        {title}
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-4 space-y-3 text-sm">{children}</div>}
    </div>
  );
}

function KeywordList({ keywords }: { keywords: unknown[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, i) => {
        const keyword =
          typeof kw === "string"
            ? kw
            : typeof (kw as any)?.keyword === "string"
            ? (kw as any).keyword
            : JSON.stringify(kw);
        return (
          <span
            key={i}
            className="rounded-full border px-2.5 py-0.5 text-xs font-medium bg-background"
          >
            {keyword}
          </span>
        );
      })}
    </div>
  );
}

export function CampaignStrategyPanel({ strategy }: CampaignStrategyPanelProps) {
  const s = strategy as any;

  // Support both AI-generated format (google/meta top-level keys) and seed/legacy format
  const rationale: string | undefined = s.strategy_rationale ?? s.summary;

  // Expected outcomes — AI format or seed estimatedResults
  const outcomes = s.expected_outcomes ?? null;
  const estimated = s.estimatedResults ?? null;

  // Google keywords — AI format: s.google.keywords | seed format: s.keywords.google
  const googleKeywords: unknown[] =
    Array.isArray(s.google?.keywords) ? s.google.keywords :
    Array.isArray(s.keywords?.google) ? s.keywords.google : [];

  const negativeKeywords: unknown[] =
    Array.isArray(s.google?.negative_keywords) ? s.google.negative_keywords :
    Array.isArray(s.keywords?.negativeKeywords) ? s.keywords.negativeKeywords : [];

  const biddingStrategy: string | undefined = s.google?.bidding_strategy;

  const adGroups: any[] =
    Array.isArray(s.google?.ad_groups) ? s.google.ad_groups :
    Array.isArray(s.adGroups) ? s.adGroups : [];

  // Targeting / audience — AI format: s.meta.audience | seed format: s.targeting
  const targeting = s.meta?.audience ?? s.targeting ?? null;
  const locations: string[] =
    Array.isArray(targeting?.locations) ? targeting.locations : [];
  const interests: unknown[] =
    Array.isArray(targeting?.interests) ? targeting.interests : [];
  const ageRange: string | undefined =
    targeting?.ageRange ??
    (targeting?.age_min && targeting?.age_max ? `${targeting.age_min}–${targeting.age_max}` : undefined);
  const gender: string | undefined = targeting?.gender;

  // India intelligence — AI format: string | seed format: object
  const indiaIntel = s.indiaIntelligence ?? null;
  const indiaNote: string | undefined =
    typeof s.india_intelligence_notes === "string" ? s.india_intelligence_notes :
    indiaIntel
      ? [indiaIntel.festivalAlert, indiaIntel.cityInsight, indiaIntel.seasonalNote]
          .filter(Boolean).join(" • ")
      : undefined;

  const hasGoogleSection = googleKeywords.length > 0 || !!biddingStrategy || adGroups.length > 0;
  const hasTargetingSection = locations.length > 0 || interests.length > 0 || !!ageRange;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">AI Campaign Strategy</h2>

      {rationale && (
        <div className="rounded-xl border p-4 bg-primary/5">
          <p className="text-sm font-medium text-primary mb-1">Why this strategy?</p>
          <p className="text-sm text-muted-foreground">{rationale}</p>
        </div>
      )}

      {/* Expected outcomes — AI format */}
      {outcomes && (
        <div className="grid grid-cols-2 gap-3">
          {outcomes.leads_per_month !== undefined && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-primary">~{outcomes.leads_per_month}</p>
              <p className="text-xs text-muted-foreground mt-1">Expected leads/month</p>
            </div>
          )}
          {outcomes.cost_per_lead_estimate !== undefined && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-primary">₹{Math.round(outcomes.cost_per_lead_estimate)}</p>
              <p className="text-xs text-muted-foreground mt-1">Est. cost per lead</p>
            </div>
          )}
        </div>
      )}

      {/* Estimated results — seed format */}
      {!outcomes && estimated && (
        <div className="grid grid-cols-2 gap-3">
          {estimated.clicks && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-xl font-bold text-primary">{estimated.clicks}</p>
              <p className="text-xs text-muted-foreground mt-1">Expected clicks</p>
            </div>
          )}
          {estimated.costPerConversion && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-xl font-bold text-primary">{estimated.costPerConversion}</p>
              <p className="text-xs text-muted-foreground mt-1">Est. cost per conversion</p>
            </div>
          )}
        </div>
      )}

      {/* Google strategy */}
      {hasGoogleSection && (
        <Section title="Google Ads Strategy">
          {biddingStrategy && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Bidding Strategy
              </p>
              <p>{biddingStrategy}</p>
            </div>
          )}
          {googleKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Target Keywords ({googleKeywords.length})
              </p>
              <KeywordList keywords={googleKeywords} />
            </div>
          )}
          {negativeKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Negative Keywords
              </p>
              <KeywordList keywords={negativeKeywords} />
            </div>
          )}
          {adGroups.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Ad Groups
              </p>
              <div className="space-y-2">
                {adGroups.map((ag: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3 text-xs">
                    <p className="font-semibold">{ag.name ?? `Ad Group ${i + 1}`}</p>
                    {ag.theme && <p className="text-muted-foreground mt-0.5">{ag.theme}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Audience targeting */}
      {hasTargetingSection && (
        <Section title="Audience Targeting">
          <div className="space-y-3">
            {(ageRange || gender) && (
              <div className="flex gap-4 text-sm">
                {ageRange && <span>Age: <strong>{ageRange}</strong></span>}
                {gender && <span>Gender: <strong className="capitalize">{(gender as string).toLowerCase()}</strong></span>}
              </div>
            )}
            {locations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Locations</p>
                <KeywordList keywords={locations} />
              </div>
            )}
            {interests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Interests</p>
                <KeywordList keywords={interests} />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* India intelligence note */}
      {indiaNote && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
            🇮🇳 India Intelligence
          </p>
          <p className="text-sm text-orange-900 dark:text-orange-100">{indiaNote}</p>
        </div>
      )}
    </div>
  );
}
