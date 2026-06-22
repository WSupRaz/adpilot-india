import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { creditService } from "../CreditService";

const competitorQueue = new Queue("ai-competitor-analyze", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export class CompetitorAnalysisService {
  async enqueue(
    userId: string,
    input: { businessId: string; competitorUrl: string; competitorName?: string }
  ): Promise<string> {
    await creditService.checkAndDeduct(userId, "competitor_analyze");

    const job = await competitorQueue.add("analyze", { userId, input });
    return job.id!;
  }
}

export const competitorAnalysisService = new CompetitorAnalysisService();
