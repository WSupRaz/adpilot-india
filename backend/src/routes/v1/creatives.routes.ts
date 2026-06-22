import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";

export const creativeRouter = Router();

creativeRouter.use(authenticate);

creativeRouter.get("/", async (req, res) => {
  // TODO: CreativeService.list(req.userId, req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

creativeRouter.post("/", aiRateLimit, async (req, res) => {
  // TODO: CreativeGeneratorService.enqueue(req.userId, req.body)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

creativeRouter.get("/:id", async (req, res) => {
  // TODO: CreativeService.getById(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

creativeRouter.delete("/:id", async (req, res) => {
  // TODO: CreativeService.delete(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
