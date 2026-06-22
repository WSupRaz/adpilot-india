import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { aiRateLimit } from "../../middleware/rateLimit.middleware";
import { createAuditSchema } from "../../validators/audit.schema";

export const auditRouter = Router();

auditRouter.use(authenticate);

auditRouter.get("/", async (req, res) => {
  // TODO: AuditService.list(req.userId, req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

auditRouter.post("/", aiRateLimit, validate(createAuditSchema), async (req, res) => {
  // TODO: AuditOrchestratorService.enqueue(req.userId, req.body)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

auditRouter.get("/:id", async (req, res) => {
  // TODO: AuditService.getById(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

auditRouter.get("/:id/pdf", async (req, res) => {
  // TODO: AuditService.getPDFUrl(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

auditRouter.get("/:id/issues", async (req, res) => {
  // TODO: AuditService.getIssues(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
