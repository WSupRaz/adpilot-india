import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { campaignGeneratorService } from "../../services/campaign/CampaignGeneratorService";
import { success } from "../../lib/response";

export const jobRouter = Router();

jobRouter.use(authenticate);

jobRouter.get("/:jobId/status", async (req, res, next) => {
  try {
    const status = await campaignGeneratorService.getStatus(req.params.jobId);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }
    return success(res, status);
  } catch (err) {
    next(err);
  }
});
