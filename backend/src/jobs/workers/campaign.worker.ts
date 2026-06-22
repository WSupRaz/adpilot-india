import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { notificationService } from "../../services/NotificationService";
import { creditService } from "../../services/CreditService";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "ai-campaign-generate",
  async (job: Job) => {
    const { userId, input, business, language, intelligence } = job.data;

    await job.updateProgress(10);

    const messages = promptRegistry.build("campaign_generate", {
      businessName: business?.name ?? "Your Business",
      businessType: business?.businessType ?? input.businessType,
      city: business?.city ?? "India",
      state: business?.state ?? "",
      cityTier: business?.cityTier ?? 2,
      goal: input.goal,
      goalDescription: input.goalDescription,
      platforms: input.platforms.join(", "),
      dailyBudgetRupees: Math.round(input.dailyBudgetPaise / 100),
      festivalContext: input.festivalContext ?? intelligence?.upcomingEvents?.[0]?.name,
      seasonalNotes: intelligence?.seasonalNotes,
      language,
    });

    await job.updateProgress(20);

    // Policy check first
    const policyMessages = promptRegistry.build("campaign_policy_check", {
      adCopy: { goalDescription: input.goalDescription, business: business?.name },
    });

    const policyResult = await aiRouter.complete({
      task: "policy_check",
      messages: policyMessages,
      userId,
    });

    await job.updateProgress(40);

    // Main generation
    const result = await aiRouter.complete({
      task: "campaign_generate",
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

    // Save campaign to database
    const campaign = await prisma.campaign.create({
      data: {
        businessId: input.businessId,
        userId,
        name: aiData.campaign_name ?? `${input.goal} Campaign`,
        goal: input.goal,
        platform: input.platforms.includes("google") && input.platforms.includes("meta") ? "both" : input.platforms[0],
        status: "draft",
        dailyBudgetPaise: input.dailyBudgetPaise,
        aiStrategy: aiData,
        aiModelUsed: result.response.model,
        aiGenerationCost: result.response.costUSD,
        festivalContext: input.festivalContext,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    await job.updateProgress(95);

    await notificationService.create(
      userId,
      "campaign_ready",
      "Your campaign is ready to review!",
      `${campaign.name} has been generated. Review and approve it to go live.`,
      `/campaigns/${campaign.id}`
    );

    await job.updateProgress(100);

    logger.info(`Campaign generated: ${campaign.id} for user ${userId}`);
    return { campaignId: campaign.id };
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

worker.on("failed", async (job, err) => {
  logger.error(`Campaign generation failed: ${job?.id}`, { error: err.message });

  if (job?.data.userId) {
    // Refund credits on failure
    await creditService.grant(job.data.userId, 15, "Refund: campaign generation failed").catch(() => {});
  }
});

export { worker as campaignWorker };
