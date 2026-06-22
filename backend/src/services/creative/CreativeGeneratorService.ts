import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { creditService } from "../CreditService";

const creativeQueue = new Queue("ai-creative-generate", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export interface CreativeInput {
  businessId: string;
  type: string; // 'image_ad', 'reel_concept', 'ugc_script', etc.
  platform: string;
  format?: string;
  goal: string;
  campaignId?: string;
}

export class CreativeGeneratorService {
  async enqueue(userId: string, input: CreativeInput): Promise<string> {
    await creditService.checkAndDeduct(userId, "creative_generate");

    const job = await creativeQueue.add("generate", { userId, input });
    return job.id!;
  }

  async getStatus(jobId: string) {
    const job = await creativeQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      status: state,
      progress: job.progress as number ?? 0,
      message: state === "completed" ? "Creative brief ready!" : "Generating creative concepts...",
      result_id: job.returnvalue?.creativeId,
    };
  }
}

export const creativeGeneratorService = new CreativeGeneratorService();
