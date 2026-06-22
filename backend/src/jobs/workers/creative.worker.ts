import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { prisma } from "../../config/database";
import { aiRouter } from "../../services/ai/AIRouter";
import { promptRegistry } from "../../services/ai/PromptRegistry";
import { detectLanguage } from "../../lib/helpers";
import { logger } from "../../lib/logger";

const worker = new Worker(
  "ai-creative-generate",
  async (job: Job) => {
    const { userId, input } = job.data;

    const business = await prisma.business.findUnique({ where: { id: input.businessId } });
    const language = detectLanguage(business?.description ?? "");

    const messages = promptRegistry.build("creative_brief", {
      businessName: business?.name ?? "Your Business",
      businessType: business?.businessType ?? "business",
      platform: input.platform,
      format: input.format ?? "1080x1080",
      goal: input.goal,
      targetAudience: business?.targetAudience ?? "general audience",
      language,
      festivalContext: null,
    });

    await job.updateProgress(30);

    const result = await aiRouter.complete({
      task: "creative_generate",
      language: language as any,
      messages,
      maxTokens: 4000,
      userId,
    });

    await job.updateProgress(80);

    let aiData: any;
    try {
      aiData = JSON.parse(result.content);
    } catch {
      aiData = { raw: result.content };
    }

    const creative = await prisma.creative.create({
      data: {
        businessId: input.businessId,
        userId,
        campaignId: input.campaignId ?? null,
        type: input.type,
        platform: input.platform,
        format: input.format,
        brief: aiData.brief ?? result.content,
        hookVariations: aiData.hooks,
        bodyCopy: aiData.body_copy,
        ctaOptions: aiData.ctas,
        visualDirection: aiData.visual_direction,
        imagePrompt: aiData.image_prompt,
        videoPrompt: aiData.video_prompt,
        storyboard: aiData.storyboard,
        status: "draft",
      },
    });

    await job.updateProgress(100);
    return { creativeId: creative.id };
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  logger.error(`Creative generation failed: ${job?.id}`, { error: err.message });
});

export { worker as creativeWorker };
