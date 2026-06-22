import { Router } from "express";

export const adminRevenueRouter = Router();

adminRevenueRouter.get("/summary", async (_req, res) => {
  // TODO: AdminRevenueService.getSummary()
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminRevenueRouter.get("/payments", async (req, res) => {
  // TODO: AdminRevenueService.listPayments(req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminRevenueRouter.get("/ai-costs", async (req, res) => {
  // TODO: AdminRevenueService.getAICosts(req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
