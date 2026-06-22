import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { createCampaignSchema, updateCampaignSchema } from "../../validators/campaign.schema";
import { campaignGeneratorService } from "../../services/campaign/CampaignGeneratorService";
import { prisma } from "../../config/database";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import { success, created } from "../../lib/response";
import { paginate } from "../../lib/helpers";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

// ── List campaigns ─────────────────────────────────────────────────────────────
campaignRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const { skip, take } = paginate(page, limit);
    const status = req.query.status as string | undefined;
    const businessId = req.query.businessId as string | undefined;

    const where = {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(businessId ? { businessId } : {}),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          goal: true,
          platform: true,
          status: true,
          dailyBudgetPaise: true,
          totalSpendPaise: true,
          totalImpressions: true,
          totalClicks: true,
          totalConversions: true,
          festivalContext: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          business: { select: { id: true, name: true, city: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return success(res, campaigns, 200, { page, limit, total });
  } catch (err) {
    next(err);
  }
});

// ── Create + enqueue AI generation ────────────────────────────────────────────
campaignRouter.post("/", aiRateLimit, validate(createCampaignSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: req.body.businessId, ownerId: userId, deletedAt: null },
    });
    if (!business) throw new NotFoundError("Business");

    const jobId = await campaignGeneratorService.enqueue(userId, req.body);

    return success(res, {
      job_id: jobId,
      status: "queued",
      poll_url: `/api/v1/jobs/${jobId}/status`,
      estimated_seconds: 45,
    });
  } catch (err) {
    next(err);
  }
});

// ── Get campaign ───────────────────────────────────────────────────────────────
campaignRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
      include: {
        business: {
          select: { id: true, name: true, city: true, businessType: true, websiteUrl: true },
        },
      },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    return success(res, campaign);
  } catch (err) {
    next(err);
  }
});

// ── Update campaign (edit before approval) ─────────────────────────────────────
campaignRouter.patch("/:id", validate(updateCampaignSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (!["draft", "pending_review"].includes(campaign.status)) {
      throw new ForbiddenError("Only draft campaigns can be edited");
    }

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.dailyBudgetPaise ? { dailyBudgetPaise: req.body.dailyBudgetPaise } : {}),
        ...(req.body.startDate ? { startDate: new Date(req.body.startDate) } : {}),
        ...(req.body.endDate ? { endDate: new Date(req.body.endDate) } : {}),
      },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Approve campaign ──────────────────────────────────────────────────────────
// Phase 1: marks as "approved" (no real publishing — draft mode only)
// Phase 2: will trigger actual Google/Meta API publish
campaignRouter.post("/:id/approve", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "draft" && campaign.status !== "pending_review") {
      throw new ForbiddenError("Campaign is not in a reviewable state");
    }

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "approved" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Pause ──────────────────────────────────────────────────────────────────────
campaignRouter.post("/:id/pause", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "live") {
      throw new ForbiddenError("Only live campaigns can be paused");
    }
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "paused" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Resume ─────────────────────────────────────────────────────────────────────
campaignRouter.post("/:id/resume", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== "paused") {
      throw new ForbiddenError("Only paused campaigns can be resumed");
    }
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: "live" },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── Soft delete ────────────────────────────────────────────────────────────────
campaignRouter.delete("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId, deletedAt: null },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});
