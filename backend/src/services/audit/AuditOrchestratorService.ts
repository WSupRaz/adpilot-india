import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { creditService } from "../CreditService";

const auditQueue = new Queue("ai-audit-analyze", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export class AuditOrchestratorService {
  async enqueue(userId: string, input: { url: string; businessId?: string }): Promise<string> {
    await creditService.checkAndDeduct(userId, "audit_analyze");

    const job = await auditQueue.add("analyze", { userId, ...input });
    return job.id!;
  }

  async getStatus(jobId: string) {
    const job = await auditQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      status: state,
      progress: job.progress as number ?? 0,
      message: state === "completed" ? "Audit complete!" : "Analysing your website...",
      result_id: job.returnvalue?.auditId,
    };
  }
}

export const auditOrchestratorService = new AuditOrchestratorService();
