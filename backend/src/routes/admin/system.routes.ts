import { Router } from "express";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";

export const adminSystemRouter = Router();

adminSystemRouter.get("/health", async (_req, res) => {
  const checks = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);

  res.json({
    success: true,
    data: {
      database: checks[0].status === "fulfilled" ? "operational" : "degraded",
      redis: checks[1].status === "fulfilled" ? "operational" : "degraded",
      timestamp: new Date().toISOString(),
    },
  });
});

adminSystemRouter.get("/ai-usage", async (req, res) => {
  // TODO: AdminSystemService.getAIUsage(req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
