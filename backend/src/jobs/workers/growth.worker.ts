import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { indiaIntelligenceService } from "../../services/india/IndiaIntelligenceService";
import { notificationService } from "../../services/NotificationService";
import { detectLanguage } from "../../lib/helpers";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "ai-growth-plan",
  async (job: Job) => {
    const { userId, input } = job.data;

    const business = await prisma.business.findUnique({ where: { id: input.businessId } });
    const intelligence = business
      ? await indiaIntelligenceService.getContextForBusiness(business.businessType ?? "", business.cityTier ?? 2)
      : null;

    const language = detectLanguage(input.goalDescription);

    const messages = promptRegistry.build("growth_plan", {
      businessName: business?.name ?? "Your Business",
      businessType: business?.businessType ?? "business",
      city: business?.city ?? "India",
      goalDescription: input.goalDescription,
      dailyBudgetRupees: Math.round(input.availableBudgetPaise / 100),
      timeframeDays: input.goalTimeframeDays,
      currentSituation: "New user — no existing campaigns",
      festivalContext: intelligence?.upcomingEvents?.map((e) => e.name).join(", "),
    });

    await job.updateProgress(30);

    const result = await aiRouter.complete({
      task: "growth_plan",
      language: language as any,
      messages,
      maxTokens: 6000,
      userId,
    });

    await job.updateProgress(80);

    let aiData: any;
    try {
      aiData = JSON.parse(result.content);
    } catch {
      aiData = { raw: result.content };
    }

    const growthPlan = await prisma.growthPlan.create({
      data: {
        businessId: input.businessId,
        userId,
        goalDescription: input.goalDescription,
        goalType: input.goalType,
        goalQuantity: input.goalQuantity,
        goalTimeframe: input.goalTimeframeDays,
        availableBudgetPaise: input.availableBudgetPaise,
        recommendedChannels: aiData.channels,
        budgetAllocation: aiData.budget_allocation,
        adStrategy: aiData.ad_strategy,
        creativeStrategy: aiData.creative_strategy,
        followupStrategy: aiData.followup_strategy,
        optimizationPlan: aiData.optimization_plan,
        expectedLeads: aiData.expected_outcomes?.leads,
        expectedCostPaise: aiData.expected_outcomes?.cost_paise,
        expectedTimelineDays: aiData.expected_outcomes?.timeline_days,
        confidenceScore: aiData.confidence_score ?? 0.7,
        status: "draft",
      },
    });

    await notificationService.create(
      userId,
      "campaign_ready",
      "Your Growth Plan is ready!",
      `We've created a strategy to get you ${input.goalQuantity} ${input.goalType}.`,
      `/growth`
    );

    await job.updateProgress(100);
    return { growthPlanId: growthPlan.id };
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
  }
);

worker.on("failed", (job, err) => {
  logger.error(`Growth plan generation failed: ${job?.id}`, { error: err.message });
});

export { worker as growthWorker };
