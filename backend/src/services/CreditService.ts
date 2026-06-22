import { prisma } from "../config/database";
import { InsufficientCreditsError } from "../lib/errors";
import type { CreditOperation } from "./ai/CostMeter";
import { CREDIT_COSTS } from "../../../shared/src/constants/credits";

export class CreditService {
  async getBalance(userId: string): Promise<{ balance: number; resetDate: string }> {
    const credits = await prisma.credits.findUnique({ where: { userId } });
    return {
      balance: credits?.balance ?? 0,
      resetDate: credits?.resetDate?.toISOString() ?? "",
    };
  }

  async checkAndDeduct(userId: string, operation: CreditOperation): Promise<void> {
    const cost = CREDIT_COSTS[operation];
    const credits = await prisma.credits.findUnique({ where: { userId } });
    const balance = credits?.balance ?? 0;

    if (balance < cost) {
      throw new InsufficientCreditsError(cost, balance);
    }

    await prisma.$transaction([
      prisma.credits.update({
        where: { userId },
        data: {
          balance: { decrement: cost },
          lifetimeUsed: { increment: cost },
        },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: -cost,
          type: operation,
          description: `Credit deduction for ${operation}`,
          balanceAfter: balance - cost,
        },
      }),
    ]);
  }

  async grant(userId: string, amount: number, reason: string): Promise<void> {
    const credits = await prisma.credits.upsert({
      where: { userId },
      create: { userId, balance: amount, lifetimeUsed: 0 },
      update: { balance: { increment: amount } },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type: "monthly_grant",
        description: reason,
        balanceAfter: credits.balance,
      },
    });
  }

  async resetMonthlyCredits(userId: string, monthlyAllowance: number): Promise<void> {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);

    await prisma.credits.upsert({
      where: { userId },
      create: { userId, balance: monthlyAllowance, lifetimeUsed: 0, resetDate: nextReset },
      update: { balance: monthlyAllowance, resetDate: nextReset },
    });
  }
}

export const creditService = new CreditService();
