import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createBusinessSchema, updateBusinessSchema } from "../../validators/business.schema";
import { businessService } from "../../services/BusinessService";
import { success, created } from "../../lib/response";

export const businessRouter = Router();

businessRouter.use(authenticate);

businessRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const businesses = await businessService.list(userId);
    return success(res, businesses);
  } catch (err) {
    next(err);
  }
});

businessRouter.post("/", validate(createBusinessSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const business = await businessService.create(userId, req.body);
    return created(res, business);
  } catch (err) {
    next(err);
  }
});

businessRouter.get("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const business = await businessService.getById(req.params.id, userId);
    return success(res, business);
  } catch (err) {
    next(err);
  }
});

businessRouter.get("/:id/stats", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const stats = await businessService.getStats(req.params.id, userId);
    return success(res, stats);
  } catch (err) {
    next(err);
  }
});

businessRouter.patch("/:id", validate(updateBusinessSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const business = await businessService.update(req.params.id, userId, req.body);
    return success(res, business);
  } catch (err) {
    next(err);
  }
});

businessRouter.delete("/:id", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    await businessService.delete(req.params.id, userId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Ad account connections — Phase 2 placeholder (returns 501 with clear message)
businessRouter.post("/:id/connect/google", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_AVAILABLE", message: "Google Ads connection available in Phase 2" },
  });
});

businessRouter.post("/:id/connect/meta", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_AVAILABLE", message: "Meta Ads connection available in Phase 2" },
  });
});
