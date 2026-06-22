import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { creditService } from "../../services/CreditService";
import { prisma } from "../../config/database";
import { success } from "../../lib/response";
import { paginate } from "../../lib/helpers";

export const creditRouter = Router();

creditRouter.use(authenticate);

creditRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const credits = await prisma.credits.findUnique({
      where: { userId },
      select: { balance: true, lifetimeUsed: true, resetDate: true },
    });
    return success(res, {
      balance: credits?.balance ?? 0,
      lifetime_used: credits?.lifetimeUsed ?? 0,
      reset_date: credits?.resetDate?.toISOString() ?? null,
    });
  } catch (err) {
    next(err);
  }
});

creditRouter.get("/transactions", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const { skip, take } = paginate(page, limit);

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          balanceAfter: true,
          createdAt: true,
        },
      }),
      prisma.creditTransaction.count({ where: { userId } }),
    ]);

    return success(res, transactions, 200, { page, limit, total });
  } catch (err) {
    next(err);
  }
});
