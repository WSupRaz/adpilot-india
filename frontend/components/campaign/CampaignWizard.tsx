"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { JobProgress } from "@/components/shared/JobProgress";
import { CampaignGenerating } from "@/components/campaign/CampaignGenerating";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

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

const newBizSchema = z.object({
  name: z.string().min(2, "Enter business name"),
  businessType: z.string().min(1, "Select a type"),
  city: z.string().min(2, "Enter city name"),
  description: z.string().min(10, "Describe your business (10+ characters)"),
});
type NewBizValues = z.infer<typeof newBizSchema>;

const STEPS = ["Goal", "Business", "Budget", "Platform", "Review"] as const;

const GOALS = [
  { value: "leads",           label: "Get Leads",       emoji: "📋", description: "Collect customer enquiries" },
  { value: "calls",           label: "Get Phone Calls", emoji: "📞", description: "Drive inbound calls" },
  { value: "bookings",        label: "Get Bookings",    emoji: "📅", description: "Appointments and reservations" },
  { value: "sales",           label: "Drive Sales",     emoji: "🛒", description: "Direct product purchases" },
  { value: "brand_awareness", label: "Brand Awareness", emoji: "📢", description: "Reach more people" },
] as const;

const BIZ_TYPES = [
  { value: "retail",        label: "Retail / Shop" },
  { value: "food_beverage", label: "Restaurant / Food" },
  { value: "education",     label: "Coaching / Education" },
  { value: "healthcare",    label: "Clinic / Healthcare" },
  { value: "services",      label: "Services / Consulting" },
  { value: "real_estate",   label: "Real Estate" },
  { value: "fashion",       label: "Fashion / Clothing" },
  { value: "other",         label: "Other" },
];

interface BusinessesResponse { data: Business[] }

export function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showNewBiz, setShowNewBiz] = useState(false);
  const [creatingBiz, setCreatingBiz] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bizData, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => apiClient.get<BusinessesResponse>("/api/v1/businesses"),
  });
  const businesses = bizData?.data ?? [];

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { platforms: ["google", "meta"], dailyBudgetPaise: 50000 },
  });
  const { watch, setValue, formState: { errors, isSubmitting } } = form;
  const selectedGoal = watch("goal");
  const selectedBusinessId = watch("businessId");
  const selectedPlatforms = watch("platforms");
  const dailyBudgetPaise = watch("dailyBudgetPaise");

  const bizForm = useForm<NewBizValues>({ resolver: zodResolver(newBizSchema) });

  async function createBusiness(data: NewBizValues) {
    setCreatingBiz(true);
    try {
      const res = await apiClient.post<{ data: Business }>("/api/v1/businesses", data);
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      setValue("businessId", res.data.id, { shouldValidate: true });
      setShowNewBiz(false);
      bizForm.reset();
      toast.success(`${res.data.name} added!`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create business");
    } finally {
      setCreatingBiz(false);
    }
  }

  async function onSubmit(data: CampaignFormValues) {
    setGenerating(true);
    try {
      const result = await apiClient.post<{ data: { campaign_id?: string; job_id?: string } }>("/api/v1/campaigns", data);
      if (result.data.campaign_id) {
        toast.success("Campaign generated! Review and approve it.");
        router.push(`/campaigns/${result.data.campaign_id}`);
      } else if (result.data.job_id) {
        setGenerating(false);
        setJobId(result.data.job_id);
      }
    } catch (err: any) {
      setGenerating(false);
      toast.error(err?.message ?? "Failed to generate campaign. Please try again.");
    }
  }

  function onJobComplete(campaignId: string) {
    toast.success("Your campaign is ready to review!");
    router.push(`/campaigns/${campaignId}`);
  }

  if (generating) {
    const biz = businesses.find((b) => b.id === form.getValues("businessId"));
    return (
      <CampaignGenerating
        businessName={biz?.name ?? "Your Business"}
        goal={form.getValues("goal") ?? "leads"}
        city={biz?.city ?? undefined}
      />
    );
  }

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

  async function handleNext() {
    let fieldsToValidate: (keyof CampaignFormValues)[] = [];
    if (step === 0) fieldsToValidate = ["goal", "goalDescription"];
    if (step === 1) fieldsToValidate = ["businessId"];
    if (step === 2) fieldsToValidate = ["dailyBudgetPaise"];
    if (step === 3) fieldsToValidate = ["platforms"];
    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

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
              <div className={`h-px w-8 transition-colors ${i < step ? "bg-primary/40" : "bg-border"}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground font-medium">{STEPS[step]}</span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Step 0: Goal ── */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">What result do you want from this campaign?</p>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map(({ value, label, emoji, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("goal", value, { shouldValidate: true })}
                  className={`rounded-lg border p-3.5 text-left flex items-center gap-3 transition-colors ${
                    selectedGoal === value ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
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
            {errors.goal && <p className="text-xs text-destructive">{errors.goal.message}</p>}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Describe your goal in your own words</label>
              <textarea
                {...form.register("goalDescription")}
                placeholder="e.g. Mujhe apni saree shop ke liye leads chahiye Bhopal se... or I want 50 new leads for my dental clinic this month"
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Hindi, Hinglish, or English — write naturally.</p>
              {errors.goalDescription && <p className="text-xs text-destructive">{errors.goalDescription.message}</p>}
            </div>
          </div>
        )}

        {/* ── Step 1: Business ── */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Which business is this campaign for?</p>

            {bizLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-16 rounded-lg border animate-pulse bg-muted" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setValue("businessId", b.id, { shouldValidate: true })}
                    className={`w-full rounded-lg border p-3.5 text-left flex items-start gap-3 transition-colors ${
                      selectedBusinessId === b.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
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

                {/* Add New Business */}
                {!showNewBiz ? (
                  <button
                    type="button"
                    onClick={() => setShowNewBiz(true)}
                    className="w-full rounded-lg border-2 border-dashed border-primary/40 p-3.5 text-left flex items-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-primary">Add New Business</p>
                      <p className="text-xs text-muted-foreground">Create a business profile to run campaigns</p>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-primary">New Business</p>
                      <button type="button" aria-label="Cancel" onClick={() => { setShowNewBiz(false); bizForm.reset(); }}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        {...bizForm.register("name")}
                        placeholder="Business name (e.g. Sharma Saree House)"
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                      />
                      {bizForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{bizForm.formState.errors.name.message}</p>
                      )}

                      <select
                        {...bizForm.register("businessType")}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                      >
                        <option value="">Select business type</option>
                        {BIZ_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {bizForm.formState.errors.businessType && (
                        <p className="text-xs text-destructive">{bizForm.formState.errors.businessType.message}</p>
                      )}

                      <input
                        {...bizForm.register("city")}
                        placeholder="City (e.g. Delhi, Mumbai, Bhopal)"
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                      />
                      {bizForm.formState.errors.city && (
                        <p className="text-xs text-destructive">{bizForm.formState.errors.city.message}</p>
                      )}

                      <textarea
                        {...bizForm.register("description")}
                        placeholder="Describe your business — Hindi, Hinglish, or English is fine. e.g. Hum Delhi mein mithai bechte hain..."
                        rows={3}
                        className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                      />
                      {bizForm.formState.errors.description && (
                        <p className="text-xs text-destructive">{bizForm.formState.errors.description.message}</p>
                      )}

                      <button
                        type="button"
                        disabled={creatingBiz}
                        onClick={bizForm.handleSubmit(createBusiness)}
                        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        {creatingBiz ? "Creating..." : "Create Business"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.businessId && (
              <p className="text-xs text-destructive">{errors.businessId.message}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Budget ── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">What is your daily ad budget?</p>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000, 5000, 10000, 20000].map((rupees) => (
                <button
                  key={rupees}
                  type="button"
                  onClick={() => setValue("dailyBudgetPaise", rupees * 100, { shouldValidate: true })}
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Or enter custom amount (₹)</label>
              <div className="flex items-center rounded-lg border overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r">₹</span>
                <input
                  type="number" min={100} step={100}
                  value={dailyBudgetPaise / 100}
                  onChange={(e) => setValue("dailyBudgetPaise", Number(e.target.value) * 100, { shouldValidate: true })}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  placeholder="500"
                />
                <span className="px-3 py-2 text-xs text-muted-foreground bg-muted border-l">/day</span>
              </div>
              {errors.dailyBudgetPaise && <p className="text-xs text-destructive">{errors.dailyBudgetPaise.message}</p>}
            </div>

            {dailyBudgetPaise >= 10000 && (
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
                <p className="font-medium">Budget summary</p>
                <p className="text-muted-foreground">
                  Daily: ₹{(dailyBudgetPaise / 100).toLocaleString("en-IN")} · Monthly est: ₹{((dailyBudgetPaise / 100) * 30).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Start Date (optional)</label>
                <input {...form.register("startDate")} type="date" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">End Date (optional)</label>
                <input {...form.register("endDate")} type="date" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Platform ── */}
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
                      const updated = isSelected
                        ? selectedPlatforms.filter((p) => p !== platform)
                        : [...selectedPlatforms, platform];
                      setValue("platforms", updated, { shouldValidate: true });
                    }}
                    className={`w-full rounded-lg border p-4 text-left flex items-center gap-4 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl font-bold ${platform === "google" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
                      {platform === "google" ? "G" : "f"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{platform === "google" ? "Google Ads" : "Meta Ads (Facebook & Instagram)"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {platform === "google"
                          ? "Search + Display — reach people actively searching for your service"
                          : "Feed + Stories — reach people by interest and demographics"}
                      </p>
                    </div>
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {isSelected && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.platforms && <p className="text-xs text-destructive">{errors.platforms.message}</p>}
          </div>
        )}

        {/* ── Step 4: Review ── */}
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
                <span className="font-medium">₹{((watch("dailyBudgetPaise") ?? 0) / 100).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-muted-foreground">Platforms</span>
                <span className="font-medium capitalize">{(watch("platforms") ?? []).join(" + ")}</span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">What happens next?</p>
              <p>1. Our AI generates keywords, ad copy, and audience targeting (15–45 seconds)</p>
              <p>2. You review and approve the campaign</p>
              <p>3. Campaign is saved — Google/Meta publishing available in Phase 2</p>
              <p className="text-primary font-medium mt-1">This uses <strong>15 AI credits</strong> from your balance.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
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
              {isSubmitting ? "Generating… Please wait" : "Generate Campaign (15 credits)"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
