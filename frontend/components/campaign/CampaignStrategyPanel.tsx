"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users, Target, BarChart2, Zap, Globe, Clock, Smartphone } from "lucide-react";

interface CampaignStrategyPanelProps {
  strategy: Record<string, unknown>;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted text-sm font-semibold text-left gap-2"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="p-4 space-y-4 text-sm">{children}</div>}
    </div>
  );
}

function Tag({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "green" | "orange" | "blue" | "purple" }) {
  const colors = {
    default: "bg-muted text-muted-foreground border",
    green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
    orange: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

function KeywordPills({ keywords }: { keywords: unknown[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((kw, i) => {
        const text = typeof kw === "string" ? kw : typeof (kw as any)?.keyword === "string" ? (kw as any).keyword : String(kw);
        return <Tag key={i}>{text}</Tag>;
      })}
    </div>
  );
}

// ── A/B Variant card ──────────────────────────────────────────────────────────
function ABVariantCard({ variant }: { variant: any }) {
  const [tab, setTab] = useState<"google" | "meta">("google");
  const colors: Record<string, string> = {
    A: "border-green-300 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
    B: "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    C: "border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  };

  const ga = variant.google_ad;
  const ma = variant.meta_ad;

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Variant header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b">
        <span className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${colors[variant.variant] ?? colors.A}`}>
          {variant.variant}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{variant.angle}</p>
          <p className="text-xs text-muted-foreground truncate">{variant.hypothesis}</p>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex border-b text-xs font-medium">
        {(["google", "meta"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 transition-colors ${tab === t ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "google" ? "G Google Ad" : "f Meta Ad"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {tab === "google" && ga && (
          <>
            <div className="rounded-lg bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ad Preview</p>
              <p className="text-[11px] text-green-700 dark:text-green-500">Ad · {ga.display_url}</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium leading-snug">
                {ga.headline_1} | {ga.headline_2} | {ga.headline_3}
              </p>
              <p className="text-xs text-muted-foreground">{ga.description_1}</p>
              <p className="text-xs text-muted-foreground">{ga.description_2}</p>
            </div>
          </>
        )}
        {tab === "meta" && ma && (
          <>
            <div className="rounded-lg bg-muted/40 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ad Preview</p>
              <p className="text-xs leading-relaxed">{ma.primary_text}</p>
              <div className="rounded border bg-card p-2 flex items-center justify-between gap-2 mt-2">
                <p className="text-sm font-semibold leading-tight">{ma.headline}</p>
                <span className="shrink-0 text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold">
                  {(ma.cta_button ?? "").replace(/_/g, " ")}
                </span>
              </div>
              {ma.visual_direction && (
                <div className="rounded border border-dashed border-muted-foreground/30 p-2 mt-2">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Visual Direction</p>
                  <p className="text-xs text-muted-foreground italic">{ma.visual_direction}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Audience segment card ─────────────────────────────────────────────────────
function AudienceSegmentCard({ segment, index }: { segment: any; index: number }) {
  const platformColor: Record<string, "green" | "blue" | "purple"> = {
    Google: "green", Meta: "blue", Both: "purple",
  };
  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{segment.name}</p>
          <p className="text-xs text-muted-foreground">{segment.size_estimate}</p>
        </div>
        <Tag color={platformColor[segment.best_platform] ?? "default"}>{segment.best_platform}</Tag>
      </div>
      <p className="text-xs text-muted-foreground">{segment.description}</p>
      {segment.pain_point && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 px-3 py-2">
          <p className="text-xs text-red-700 dark:text-red-400">
            <span className="font-medium">Pain point: </span>{segment.pain_point}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">{segment.targeting_approach}</p>
        {segment.estimated_cpa && (
          <span className="text-xs font-bold text-primary">{segment.estimated_cpa} / lead</span>
        )}
      </div>
    </div>
  );
}

export function CampaignStrategyPanel({ strategy }: CampaignStrategyPanelProps) {
  const s = strategy as any;

  // Normalise: support both v1 seed format and v2 AI format
  const rationale: string | undefined = s.strategy_rationale ?? s.summary;
  const budgetAlloc = s.budget_allocation ?? null;
  const google = s.google ?? null;
  const meta = s.meta ?? null;
  const abVariants: any[] = Array.isArray(s.ab_variants) ? s.ab_variants : [];
  const audienceSegments: any[] = Array.isArray(s.audience_segments) ? s.audience_segments : [];
  const outcomes = s.expected_outcomes ?? null;
  const intelV2 = s.india_intelligence ?? null;
  const hindiVariants = s.hindi_variants ?? null;

  // v1 seed compat: keywords.google / targeting / indiaIntelligence
  const googleKeywords: unknown[] =
    Array.isArray(google?.keywords) ? google.keywords :
    Array.isArray(s.keywords?.google) ? s.keywords.google : [];
  const negativeKeywords: unknown[] =
    Array.isArray(google?.negative_keywords) ? google.negative_keywords :
    Array.isArray(s.keywords?.negativeKeywords) ? s.keywords.negativeKeywords : [];
  const adGroups: any[] =
    Array.isArray(google?.ad_groups) ? google.ad_groups :
    Array.isArray(s.adGroups) ? s.adGroups : [];

  const intelNote: string | undefined =
    intelV2
      ? [intelV2.city_insight, intelV2.competitor_note, intelV2.festival_note].filter(Boolean).join("\n\n")
      : typeof s.india_intelligence_notes === "string" ? s.india_intelligence_notes
      : s.indiaIntelligence
        ? [s.indiaIntelligence.festivalAlert, s.indiaIntelligence.cityInsight, s.indiaIntelligence.seasonalNote].filter(Boolean).join(" • ")
        : undefined;

  const quickWins: string[] = Array.isArray(intelV2?.quick_wins) ? intelV2.quick_wins : [];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">AI Campaign Strategy</h2>

      {/* Strategy rationale */}
      {rationale && (
        <div className="rounded-xl border border-primary/20 p-4 bg-primary/5">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Why this strategy</p>
          <p className="text-sm leading-relaxed">{rationale}</p>
        </div>
      )}

      {/* Budget split */}
      {budgetAlloc && (
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Budget Allocation</p>
          <div className="flex gap-2 mb-2">
            <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-center border border-red-100 dark:border-red-900">
              <p className="text-xl font-bold text-red-600">{budgetAlloc.google_percent}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Google Ads</p>
            </div>
            <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-center border border-blue-100 dark:border-blue-900">
              <p className="text-xl font-bold text-blue-600">{budgetAlloc.meta_percent}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Meta Ads</p>
            </div>
          </div>
          {/* Visual split bar using flex-none segments based on ratio */}
          <div className="h-2 rounded-full overflow-hidden flex gap-px bg-muted">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full ${i < Math.round(budgetAlloc.google_percent / 10) ? "bg-red-400" : "bg-blue-500"}`}
              />
            ))}
          </div>
          {budgetAlloc.reasoning && (
            <p className="text-xs text-muted-foreground mt-2">{budgetAlloc.reasoning}</p>
          )}
        </div>
      )}

      {/* Expected outcomes */}
      {outcomes && (
        <div className="grid grid-cols-2 gap-2">
          {outcomes.leads_per_month !== undefined && (
            <div className="rounded-xl border p-3 text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900">
              <p className="text-2xl font-bold text-orange-600">~{outcomes.leads_per_month}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Est. leads/month</p>
            </div>
          )}
          {outcomes.cost_per_lead_estimate !== undefined && (
            <div className="rounded-xl border p-3 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
              <p className="text-2xl font-bold text-green-600">₹{Math.round(outcomes.cost_per_lead_estimate)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Est. cost per lead</p>
            </div>
          )}
          {outcomes.impressions_monthly && (
            <div className="rounded-xl border p-3 text-center">
              <p className="text-base font-bold">{outcomes.impressions_monthly}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly impressions</p>
            </div>
          )}
          {outcomes.roas_estimate !== undefined && outcomes.roas_estimate > 0 && (
            <div className="rounded-xl border p-3 text-center">
              <p className="text-base font-bold">{outcomes.roas_estimate}x</p>
              <p className="text-xs text-muted-foreground mt-0.5">Est. ROAS</p>
            </div>
          )}
        </div>
      )}

      {/* A/B Test Variants */}
      {abVariants.length > 0 && (
        <Section title="A/B Test Variants" icon={BarChart2}>
          <p className="text-xs text-muted-foreground -mt-2">
            Run all 3 simultaneously for the first 7 days, then double the budget on the winner.
          </p>
          <div className="space-y-3">
            {abVariants.map((v, i) => <ABVariantCard key={i} variant={v} />)}
          </div>
        </Section>
      )}

      {/* Audience Segments */}
      {audienceSegments.length > 0 && (
        <Section title="Audience Segments" icon={Users}>
          <div className="space-y-3">
            {audienceSegments.map((seg, i) => <AudienceSegmentCard key={i} segment={seg} index={i} />)}
          </div>
        </Section>
      )}

      {/* Google Ads Strategy */}
      {(googleKeywords.length > 0 || adGroups.length > 0 || google?.bidding_strategy) && (
        <Section title="Google Ads Strategy" icon={Target} defaultOpen={false}>
          {google?.bidding_strategy && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Bidding Strategy</p>
              <p className="text-sm">{google.bidding_strategy}</p>
            </div>
          )}
          {/* Device split */}
          {google?.device_split && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Smartphone className="h-3 w-3" /> Device Split
              </p>
              <div className="flex gap-2 text-xs">
                <span className="bg-muted rounded px-2 py-1">📱 Mobile {google.device_split.mobile_percent}%</span>
                <span className="bg-muted rounded px-2 py-1">💻 Desktop {google.device_split.desktop_percent}%</span>
              </div>
              {google.device_split.reasoning && <p className="text-xs text-muted-foreground mt-1">{google.device_split.reasoning}</p>}
            </div>
          )}
          {/* Day parting */}
          {google?.day_parting && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Best Times to Run
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(google.day_parting.peak_hours) && google.day_parting.peak_hours.map((h: string, i: number) => (
                  <Tag key={i} color="green">🔥 {h}</Tag>
                ))}
                {Array.isArray(google.day_parting.low_hours) && google.day_parting.low_hours.map((h: string, i: number) => (
                  <Tag key={i} color="orange">⬇ {h}</Tag>
                ))}
              </div>
            </div>
          )}
          {googleKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Target Keywords ({googleKeywords.length})</p>
              <KeywordPills keywords={googleKeywords} />
            </div>
          )}
          {negativeKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Negative Keywords</p>
              <KeywordPills keywords={negativeKeywords} />
            </div>
          )}
          {adGroups.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ad Groups</p>
              <div className="space-y-2">
                {adGroups.map((ag: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{ag.name ?? `Ad Group ${i + 1}`}</p>
                      {ag.estimated_cpc && <span className="text-xs text-muted-foreground">{ag.estimated_cpc} CPC</span>}
                    </div>
                    {ag.theme && <p className="text-xs text-muted-foreground mt-0.5">{ag.theme}</p>}
                    {Array.isArray(ag.keywords) && ag.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ag.keywords.map((kw: string, j: number) => <Tag key={j}>{kw}</Tag>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Hindi variants */}
      {hindiVariants && (
        <Section title="Hindi / Hinglish Variants" icon={Globe} defaultOpen={false}>
          <div className="space-y-2">
            {hindiVariants.headline_1 && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Headline 1</p>
                <p className="text-sm font-medium">{hindiVariants.headline_1}</p>
              </div>
            )}
            {hindiVariants.headline_2 && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Headline 2</p>
                <p className="text-sm font-medium">{hindiVariants.headline_2}</p>
              </div>
            )}
            {hindiVariants.primary_text && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Meta Primary Text</p>
                <p className="text-sm leading-relaxed">{hindiVariants.primary_text}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* India Intelligence */}
      {(intelNote || quickWins.length > 0) && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-900 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
            <p className="text-xs font-bold text-white uppercase tracking-wide">🇮🇳 India Market Intelligence</p>
          </div>
          <div className="p-4 space-y-3">
            {intelNote && (
              <p className="text-sm leading-relaxed whitespace-pre-line">{intelNote}</p>
            )}
            {quickWins.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Quick wins — first 7 days</p>
                <ul className="space-y-1.5">
                  {quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
