"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { JobProgress } from "@/components/shared/JobProgress";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

// ── Schema ────────────────────────────────────────────────────────────────────

const campaignSchema = z.object({
  goal: z.enum(["leads", "sales", "calls", "bookings", "brand_awareness"], {
    required_error: "Please select a goal",
  }),
  goalDescription: z
    .string()
    .min(10, "Describe your goal in at least 10 characters (Hindi or English is fine)")
    .max(1000),
  businessId: z.string().uuid({ message: "Please select a business" }),
  dailyBudgetPaise: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .int()
    .min(10000, "Minimum daily budget is ₹100")
    .max(100_000_000, "Maximum daily budget is ₹10,00,000"),
  platforms: z
    .array(z.enum(["google", "meta"]))
    .min(1, "Select at least one platform"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  festivalContext: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = ["Goal", "Business", "Budget", "Platform", "Review"] as const;
type Step = (typeof STEPS)[number];

const GOALS = [
  { value: "leads",           label: "Get Leads",       emoji: "📋", description: "Collect customer enquiries" },
  { value: "calls",           label: "Get Phone Calls", emoji: "📞", description: "Drive inbound calls" },
  { value: "bookings",        label: "Get Bookings",    emoji: "📅", description: "Appointments and reservations" },
  { value: "sales",           label: "Drive Sales",     emoji: "🛒", description: "Direct product purchases" },
  { value: "brand_awareness", label: "Brand Awareness", emoji: "📢", description: "Reach more people" },
] as const;

interface BusinessesResponse {
  data: Business[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();

  const { data: bizData, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses"),
  });

  const businesses = bizData?.data ?? [];

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      platforms: ["google", "meta"],
      dailyBudgetPaise: 50000, // ₹500 default
    },
  });

  const { watch, setValue, formState: { errors, isSubmitting } } = form;
  const selectedGoal = watch("goal");
  const selectedBusinessId = watch("businessId");
  const selectedPlatforms = watch("platforms");
  const dailyBudgetPaise = watch("dailyBudgetPaise");

  // ── Submit ────────────────────────────────────────────────────────────────

  async function onSubmit(data: CampaignFormValues) {
    try {
      const result = await apiClient.post<{ data: { job_id: string } }>(
        "/api/v1/campaigns",
        data
      );
      setJobId(result.data.job_id);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start campaign generation. Please try again.");
    }
  }

  function onJobComplete(campaignId: string) {
    toast.success("Your campaign is ready to review!");
    router.push(`/campaigns/${campaignId}`);
  }

  // ── Show job progress after submit ────────────────────────────────────────

  if (jobId) {
    return (
      <JobProgress
        jobId={jobId}
        title="Generating your campaign..."
        description="Our AI is building keywords, ad copy, and audience targeting. This takes 30–60 seconds."
        onComplete={onJobComplete}
      />
    );
  }

  // ── Step validation before proceeding ────────────────────────────────────

  async function handleNext() {
    let fieldsToValidate: (keyof CampaignFormValues)[] = [];
    if (step === 0) fieldsToValidate = ["goal", "goalDescription"];
    if (step === 1) fieldsToValidate = ["businessId"];
    if (step === 2) fieldsToValidate = ["dailyBudgetPaise"];
    if (step === 3) fieldsToValidate = ["platforms"];

    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  // ── Find selected business ─────────────────────────────────────────────

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 transition-colors ${
                  i < step ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground font-medium">
          {STEPS[step]}
        </span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Step 0: Goal ───────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">
                What result do you want from this campaign?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {GOALS.map(({ value, label, emoji, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("goal", value, { shouldValidate: true })}
                    className={`rounded-lg border p-3.5 text-left flex items-center gap-3 transition-colors ${
                      selectedGoal === value
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.goal && (
                <p className="text-xs text-destructive mt-1">{errors.goal.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Describe your goal in your own words
              </label>
              <textarea
                {...form.register("goalDescription")}
                placeholder="e.g. Mujhe apni saree shop ke liye leads chahiye Bhopal se... or I want 50 new leads for my dental clinic this month"
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Hindi, Hinglish, or English — write naturally.
              </p>
              {errors.goalDescription && (
                <p className="text-xs text-destructive">{errors.goalDescription.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Business ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Which business is this campaign for?</p>

            {bizLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-lg border animate-pulse bg-muted" />
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t added a business yet.
                </p>
                <a
                  href="/settings"
                  className="inline-block rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Add your business →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setValue("businessId", b.id, { shouldValidate: true })}
                    className={`w-full rounded-lg border p-3.5 text-left flex items-start gap-3 transition-colors ${
                      selectedBusinessId === b.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {b.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[b.businessType, b.city].filter(Boolean).join(" · ") || "No details yet"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.businessId && (
              <p className="text-xs text-destructive">{errors.businessId.message}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Budget ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">What is your daily ad budget?</p>

            {/* Quick select */}
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000, 5000, 10000, 20000].map((rupees) => (
                <button
                  key={rupees}
                  type="button"
                  onClick={() =>
                    setValue("dailyBudgetPaise", rupees * 100, { shouldValidate: true })
                  }
                  className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    dailyBudgetPaise === rupees * 100
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:border-muted-foreground"
                  }`}
                >
                  ₹{rupees.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Or enter custom amount (₹)</label>
              <div className="flex items-center rounded-lg border overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r">₹</span>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={dailyBudgetPaise / 100}
                  onChange={(e) =>
                    setValue("dailyBudgetPaise", Number(e.target.value) * 100, {
                      shouldValidate: true,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  placeholder="500"
                />
                <span className="px-3 py-2 text-xs text-muted-foreground bg-muted border-l">
                  /day
                </span>
              </div>
              {errors.dailyBudgetPaise && (
                <p className="text-xs text-destructive">{errors.dailyBudgetPaise.message}</p>
              )}
            </div>

            {/* Monthly estimate */}
            {dailyBudgetPaise >= 10000 && (
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
                <p className="font-medium">Budget summary</p>
                <p className="text-muted-foreground">
                  Daily: ₹{(dailyBudgetPaise / 100).toLocaleString("en-IN")} ·{" "}
                  Monthly est: ₹{((dailyBudgetPaise / 100) * 30).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Start Date (optional)
                </label>
                <input
                  {...form.register("startDate")}
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  End Date (optional)
                </label>
                <input
                  {...form.register("endDate")}
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Platform ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Where should this campaign run?</p>

            <div className="space-y-2">
              {(["google", "meta"] as const).map((platform) => {
                const isSelected = selectedPlatforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      const current = selectedPlatforms;
                      const updated = isSelected
                        ? current.filter((p) => p !== platform)
                        : [...current, platform];
                      setValue("platforms", updated, { shouldValidate: true });
                    }}
                    className={`w-full rounded-lg border p-4 text-left flex items-center gap-4 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl ${
                        platform === "google" ? "bg-red-50" : "bg-blue-50"
                      }`}
                    >
                      {platform === "google" ? "G" : "f"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm capitalize">
                        {platform === "google" ? "Google Ads" : "Meta Ads (Facebook & Instagram)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {platform === "google"
                          ? "Search + Display — reach people actively searching for your service"
                          : "Feed + Stories — reach people by interest and demographics"}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && (
                        <span className="text-primary-foreground text-[10px] font-bold">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.platforms && (
              <p className="text-xs text-destructive">{errors.platforms.message}</p>
            )}
          </div>
        )}

        {/* ── Step 4: Review ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Review your campaign details</p>

            <div className="rounded-xl border divide-y text-sm">
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium">{selectedBusiness?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-medium capitalize">{watch("goal")?.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-muted-foreground">Daily Budget</span>
                <span className="font-medium">
                  ₹{((watch("dailyBudgetPaise") ?? 0) / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-muted-foreground">Platforms</span>
                <span className="font-medium capitalize">
                  {(watch("platforms") ?? []).join(" + ")}
                </span>
              </div>
              {watch("startDate") && (
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{watch("startDate")}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">What happens next?</p>
              <p>
                1. Our AI generates keywords, ad copy, and audience targeting (30–60 seconds)
              </p>
              <p>2. You review and approve the campaign</p>
              <p>3. Campaign is saved — Google/Meta publishing available in Phase 2</p>
              <p className="text-primary font-medium mt-1">
                This uses <strong>15 AI credits</strong> from your balance.
              </p>
            </div>
          </div>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex justify-between pt-2 border-t">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-muted"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {isSubmitting ? "Starting..." : "Generate Campaign (15 credits)"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
