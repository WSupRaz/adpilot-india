import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";

export const growthRouter = Router();

growthRouter.use(authenticate);

growthRouter.get("/", async (req, res) => {
  // TODO: GrowthPlanService.list(req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

growthRouter.post("/", aiRateLimit, async (req, res) => {
  // TODO: GrowthPlanService.enqueue(req.userId, req.body)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

growthRouter.get("/:id", async (req, res) => {
  // TODO: GrowthPlanService.getById(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
