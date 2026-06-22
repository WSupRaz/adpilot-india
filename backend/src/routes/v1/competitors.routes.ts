import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";

export const competitorRouter = Router();

competitorRouter.use(authenticate);

competitorRouter.get("/", async (req, res) => {
  // TODO: CompetitorService.list(req.userId, req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

competitorRouter.post("/", aiRateLimit, async (req, res) => {
  // TODO: CompetitorAnalysisService.enqueue(req.userId, req.body)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

competitorRouter.get("/:id", async (req, res) => {
  // TODO: CompetitorService.getById(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
