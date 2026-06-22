import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

export const teamRouter = Router();

teamRouter.use(authenticate);

teamRouter.get("/", async (req, res) => {
  // TODO: TeamService.getTeam(req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

teamRouter.post("/invite", async (req, res) => {
  // TODO: TeamService.invite(req.userId, req.body)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

teamRouter.patch("/members/:memberId/role", async (req, res) => {
  // TODO: TeamService.updateMemberRole(req.userId, req.params.memberId, req.body.role)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

teamRouter.delete("/members/:memberId", async (req, res) => {
  // TODO: TeamService.removeMember(req.userId, req.params.memberId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
