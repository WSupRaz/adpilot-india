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
  const google = strategy.google as any;
  const meta = strategy.meta as any;
  const expectedOutcomes = strategy.expected_outcomes as any;
  const indiaNote = strategy.india_intelligence_notes as string | undefined;
  const rationale = strategy.strategy_rationale as string | undefined;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">AI Campaign Strategy</h2>

      {rationale && (
        <div className="rounded-xl border p-4 bg-primary/5">
          <p className="text-sm font-medium text-primary mb-1">Why this strategy?</p>
          <p className="text-sm text-muted-foreground">{rationale}</p>
        </div>
      )}

      {/* Expected outcomes */}
      {expectedOutcomes && (
        <div className="grid grid-cols-2 gap-3">
          {expectedOutcomes.leads_per_month !== undefined && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ~{expectedOutcomes.leads_per_month}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Expected leads/month</p>
            </div>
          )}
          {expectedOutcomes.cost_per_lead_estimate !== undefined && (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ₹{Math.round(expectedOutcomes.cost_per_lead_estimate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimated cost per lead</p>
            </div>
          )}
        </div>
      )}

      {/* Google strategy */}
      {google && (
        <Section title="Google Ads Strategy">
          {google.bidding_strategy && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Bidding Strategy
              </p>
              <p>{google.bidding_strategy}</p>
            </div>
          )}
          {Array.isArray(google.keywords) && google.keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Target Keywords ({google.keywords.length})
              </p>
              <KeywordList keywords={google.keywords} />
            </div>
          )}
          {Array.isArray(google.negative_keywords) && google.negative_keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Negative Keywords
              </p>
              <KeywordList keywords={google.negative_keywords} />
            </div>
          )}
          {Array.isArray(google.ad_groups) && google.ad_groups.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Ad Groups
              </p>
              <div className="space-y-2">
                {(google.ad_groups as any[]).map((ag: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3 text-xs">
                    <p className="font-semibold">{ag.name ?? `Ad Group ${i + 1}`}</p>
                    {ag.theme && (
                      <p className="text-muted-foreground mt-0.5">Theme: {ag.theme}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Meta strategy */}
      {meta && (
        <Section title="Meta Ads Strategy">
          {meta.audience && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Audience Targeting
              </p>
              <div className="space-y-1 text-sm">
                {meta.audience.age_min && meta.audience.age_max && (
                  <p>Age: {meta.audience.age_min}–{meta.audience.age_max}</p>
                )}
                {Array.isArray(meta.audience.locations) && (
                  <p>Locations: {(meta.audience.locations as string[]).join(", ")}</p>
                )}
                {Array.isArray(meta.audience.interests) && meta.audience.interests.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Interests:</p>
                    <KeywordList keywords={meta.audience.interests} />
                  </div>
                )}
              </div>
            </div>
          )}
          {Array.isArray(meta.ad_sets) && meta.ad_sets.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Ad Sets
              </p>
              <div className="space-y-2">
                {(meta.ad_sets as any[]).map((as: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3 text-xs">
                    <p className="font-semibold">{as.name ?? `Ad Set ${i + 1}`}</p>
                    {as.objective && (
                      <p className="text-muted-foreground mt-0.5">Objective: {as.objective}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* India intelligence note */}
      {indiaNote && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
            India Intelligence
          </p>
          <p className="text-sm text-orange-900 dark:text-orange-100">{indiaNote}</p>
        </div>
      )}
    </div>
  );
}
