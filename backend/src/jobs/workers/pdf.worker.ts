import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { pdfGeneratorService } from "../../services/audit/PDFGeneratorService";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "pdf-report-generate",
  async (job: Job) => {
    const { type, referenceId } = job.data;

    if (type === "audit") {
      const pdfUrl = await pdfGeneratorService.generateAuditReport(referenceId);
      return { pdfUrl };
    }

    throw new Error(`Unknown PDF type: ${type}`);
  },
  { connection: createRedisConnection(), concurrency: 2 }
);

worker.on("failed", (job, err) => {
  logger.error(`PDF generation failed: ${job?.id}`, { error: err.message });
});

export { worker as pdfWorker };
