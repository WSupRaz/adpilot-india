import { prisma } from "../../config/database";
import { NotFoundError, ForbiddenError, AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";

export class CampaignPublisherService {
  async approve(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true },
    });

    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.userId !== userId) throw new ForbiddenError();
    if (campaign.status !== "draft" && campaign.status !== "pending_review") {
      throw new AppError(400, "INVALID_STATE", "Campaign cannot be approved in its current state");
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "approved" },
    });

    // Phase 2: trigger actual publishing to Google/Meta
    // For now, mark as approved and log
    logger.info(`Campaign ${campaignId} approved by user ${userId}`);

    return { message: "Campaign approved and queued for publishing" };
  }

  async pause(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.userId !== userId) throw new ForbiddenError();

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "paused" },
    });

    // Phase 2: pause on Google/Meta APIs
  }

  async resume(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.userId !== userId) throw new ForbiddenError();

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "live" },
    });
  }
}

export const campaignPublisherService = new CampaignPublisherService();
