import { Router } from "express";

export const adminUsersRouter = Router();

adminUsersRouter.get("/", async (req, res) => {
  // TODO: AdminUserService.list(req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminUsersRouter.get("/:id", async (req, res) => {
  // TODO: AdminUserService.getById(req.params.id)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminUsersRouter.patch("/:id/plan", async (req, res) => {
  // TODO: AdminUserService.changePlan(req.params.id, req.body.planId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminUsersRouter.post("/:id/credits", async (req, res) => {
  // TODO: AdminUserService.grantCredits(req.params.id, req.body.amount)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

adminUsersRouter.post("/:id/suspend", async (req, res) => {
  // TODO: AdminUserService.suspend(req.params.id)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
