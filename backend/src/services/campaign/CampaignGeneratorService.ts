import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { creditService } from "../CreditService";
import { detectLanguage } from "../../lib/helpers";
import { indiaIntelligenceService } from "../india/IndiaIntelligenceService";

export interface CampaignGenerateInput {
  businessId: string;
  goal: string;
  goalDescription: string;
  platforms: string[];
  dailyBudgetPaise: number;
  startDate?: string;
  endDate?: string;
  festivalContext?: string;
}

const campaignQueue = new Queue("ai-campaign-generate", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export class CampaignGeneratorService {
  async enqueue(userId: string, input: CampaignGenerateInput): Promise<string> {
    // Deduct credits before queuing
    await creditService.checkAndDeduct(userId, "campaign_generate");

    // Detect language for model selection
    const language = detectLanguage(input.goalDescription);

    // Enrich with India intelligence
    const business = await prisma.business.findUnique({
      where: { id: input.businessId },
    });

    const intelligence = business
      ? await indiaIntelligenceService.getContextForBusiness(
          business.businessType ?? "",
          business.cityTier ?? 2
        )
      : null;

    const job = await campaignQueue.add("generate", {
      userId,
      input,
      business,
      language,
      intelligence,
    });

    return job.id!;
  }

  async getStatus(jobId: string) {
    const job = await campaignQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress as number | undefined;

    return {
      status: state,
      progress: progress ?? 0,
      message: this.getStatusMessage(state),
      result_id: job.returnvalue?.campaignId,
    };
  }

  private getStatusMessage(state: string): string {
    const messages: Record<string, string> = {
      waiting: "Queued...",
      active: "AI is generating your campaign...",
      completed: "Campaign ready!",
      failed: "Generation failed. Credits have been refunded.",
    };
    return messages[state] ?? "Processing...";
  }
}

export const campaignGeneratorService = new CampaignGeneratorService();
