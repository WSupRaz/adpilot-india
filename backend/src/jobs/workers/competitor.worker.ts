import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { metaAdLibraryService } from "../../services/competitor/MetaAdLibraryService";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "ai-competitor-analyze",
  async (job: Job) => {
    const { userId, input } = job.data;

    const analysis = await prisma.competitorAnalysis.create({
      data: {
        businessId: input.businessId,
        userId,
        competitorUrl: input.competitorUrl,
        competitorName: input.competitorName,
        status: "pending",
      },
    });

    const business = await prisma.business.findUnique({ where: { id: input.businessId } });

    await job.updateProgress(20);

    // Fetch public Meta Ad Library data (legal, free)
    const competitorDomain = new URL(input.competitorUrl).hostname.replace("www.", "");
    const metaAds = await metaAdLibraryService.fetchAds(competitorDomain);

    await job.updateProgress(50);

    const messages = promptRegistry.build("competitor_analyze", {
      businessName: business?.name ?? "Your Business",
      competitorUrl: input.competitorUrl,
      metaAds,
      organicKeywords: [],
    });

    const result = await aiRouter.complete({
      task: "competitor_analyze",
      messages,
      maxTokens: 5000,
      userId,
      referenceId: analysis.id,
      referenceType: "competitor_analysis",
    });

    await job.updateProgress(85);

    let aiData: any;
    try {
      aiData = JSON.parse(result.content);
    } catch {
      aiData = { raw: result.content };
    }

    await prisma.competitorAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "complete",
        positioningAnalysis: aiData.positioning,
        keywordOpportunities: aiData.keyword_opportunities,
        contentGaps: aiData.content_gaps,
        marketGaps: aiData.market_gaps,
        adAngles: aiData.ad_angles,
        swotAnalysis: aiData.swot,
        activeMetaAds: metaAds,
        completedAt: new Date(),
      },
    });

    await job.updateProgress(100);
    return { analysisId: analysis.id };
  },
  {
    connection: createRedisConnection(),
    concurrency: 2,
  }
);

worker.on("failed", (job, err) => {
  logger.error(`Competitor analysis failed: ${job?.id}`, { error: err.message });
});

export { worker as competitorWorker };
