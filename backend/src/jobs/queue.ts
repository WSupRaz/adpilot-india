import { Queue, QueueOptions } from "bullmq";
import { createRedisConnection } from "../config/redis";

const defaultOptions: Partial<QueueOptions> = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 * 7 },
  },
};

export const queues = {
  campaignGenerate: new Queue("ai-campaign-generate", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  auditAnalyze: new Queue("ai-audit-analyze", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  creativeGenerate: new Queue("ai-creative-generate", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  competitorAnalyze: new Queue("ai-competitor-analyze", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  growthPlan: new Queue("ai-growth-plan", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  pdfGenerate: new Queue("pdf-report-generate", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
  whatsappSend: new Queue("whatsapp-send", {
    connection: createRedisConnection(),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 },
    },
  }),
  emailNotification: new Queue("email-notifications", {
    connection: createRedisConnection(),
    ...defaultOptions,
  }),
};

export function startWorkers() {
  // Imported and started from individual worker files
}

export function startSchedulers() {
  // Imported and started from individual scheduler files
}
