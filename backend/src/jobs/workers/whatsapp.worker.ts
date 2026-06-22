import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "whatsapp-send",
  async (job: Job) => {
    const { to, message, templateName, templateParams } = job.data;

    // Phase 3: WhatsApp Business API integration
    // For now, log the message
    logger.info(`WhatsApp message queued to ${to}`, { templateName });

    // TODO: Call Gupshup or WABA API
    return { messageId: null, status: "queued_phase3" };
  },
  { connection: createRedisConnection(), concurrency: 10 }
);

worker.on("failed", (job, err) => {
  logger.error(`WhatsApp send failed: ${job?.id}`, { error: err.message });
});

export { worker as whatsappWorker };
