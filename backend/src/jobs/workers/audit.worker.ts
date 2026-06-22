import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { lighthouseService } from "../../services/audit/LighthouseService";
import { pdfGeneratorService } from "../../services/audit/PDFGeneratorService";
import { notificationService } from "../../services/NotificationService";
import { creditService } from "../../services/CreditService";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "ai-audit-analyze",
  async (job: Job) => {
    const { userId, url, businessId } = job.data;

    const audit = await prisma.audit.create({
      data: { userId, url, businessId: businessId ?? null, status: "crawling" },
    });

    await job.updateProgress(10);

    // Phase 1: AI-only analysis (Lighthouse integration in Phase 2)
    await prisma.audit.update({ where: { id: audit.id }, data: { status: "analyzing" } });
    await job.updateProgress(30);

    const lighthouseData = await lighthouseService.run(url);
    await job.updateProgress(50);

    const messages = promptRegistry.build("audit_analyze", {
      url,
      lighthouseData,
      crawlData: {},
    });

    const result = await aiRouter.complete({
      task: "audit_analyze",
      messages,
      maxTokens: 8000,
      userId,
      referenceId: audit.id,
      referenceType: "audit",
    });

    await job.updateProgress(80);

    let aiData: any;
    try {
      aiData = JSON.parse(result.content);
    } catch {
      aiData = {};
    }

    // Save audit results
    await prisma.audit.update({
      where: { id: audit.id },
      data: {
        status: "complete",
        overallScore: aiData.overall_score ?? 0,
        seoScore: aiData.scores?.seo,
        uxScore: aiData.scores?.ux,
        mobileScore: aiData.scores?.mobile,
        speedScore: aiData.scores?.speed,
        conversionScore: aiData.scores?.conversion,
        trustScore: aiData.scores?.trust,
        adReadinessScore: aiData.scores?.ad_readiness,
        aiAnalysis: aiData,
        lighthouseData: lighthouseData.rawData,
        completedAt: new Date(),
      },
    });

    // Save individual issues
    if (aiData.issues?.length) {
      await prisma.auditIssue.createMany({
        data: aiData.issues.map((issue: any, i: number) => ({
          auditId: audit.id,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          impactScore: issue.impact_score ?? 50,
          effortScore: issue.effort_score ?? 50,
          sortOrder: i,
        })),
      });
    }

    await job.updateProgress(90);

    // Generate PDF
    await pdfGeneratorService.generateAuditReport(audit.id).catch(() => {});

    await notificationService.create(
      userId,
      "audit_complete",
      "Your website audit is ready!",
      `View your full report for ${url}`,
      `/audit`
    );

    await job.updateProgress(100);
    return { auditId: audit.id };
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
  }
);

worker.on("failed", async (job, err) => {
  logger.error(`Audit failed: ${job?.id}`, { error: err.message });

  if (job?.data.userId) {
    await creditService.grant(job.data.userId, 10, "Refund: audit failed").catch(() => {});
  }
});

export { worker as auditWorker };
