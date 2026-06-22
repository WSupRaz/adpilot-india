import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { creditService } from "../CreditService";

const growthQueue = new Queue("ai-growth-plan", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export interface GrowthPlanInput {
  businessId: string;
  goalDescription: string;
  goalType: "leads" | "sales" | "calls" | "revenue";
  goalQuantity: number;
  goalTimeframeDays: number;
  availableBudgetPaise: number;
}

export class GrowthPlanService {
  async enqueue(userId: string, input: GrowthPlanInput): Promise<string> {
    await creditService.checkAndDeduct(userId, "growth_plan");

    const job = await growthQueue.add("generate", { userId, input });
    return job.id!;
  }

  async getStatus(jobId: string) {
    const job = await growthQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      status: state,
      progress: job.progress as number ?? 0,
      message: state === "completed" ? "Growth plan ready!" : "Building your growth strategy...",
      result_id: job.returnvalue?.growthPlanId,
    };
  }
}

export const growthPlanService = new GrowthPlanService();
