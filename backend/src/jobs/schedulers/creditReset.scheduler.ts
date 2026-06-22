import { prisma } from "../../config/database";
import { creditService } from "../../services/CreditService";
import { logger } from "../../lib/logger";

export async function runCreditReset() {
  logger.info("Running monthly credit reset...");

  const now = new Date();

  const usersToReset = await prisma.credits.findMany({
    where: {
      resetDate: { lte: now },
    },
    include: {
      user: {
        include: {
          subscriptions: {
            where: { status: "active" },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  logger.info(`Resetting credits for ${usersToReset.length} users`);

  for (const credit of usersToReset) {
    const activePlan = credit.user.subscriptions[0]?.plan;
    const monthlyAllowance = activePlan?.creditsPerMonth ?? 50; // Starter default

    await creditService.resetMonthlyCredits(credit.userId, monthlyAllowance);
    logger.info(`Credits reset for user ${credit.userId}: ${monthlyAllowance} credits`);
  }
}

export function startCreditResetScheduler() {
  // Run daily at midnight IST (18:30 UTC)
  // In production use a proper cron library or Railway scheduled job
  const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

  setInterval(async () => {
    try {
      await runCreditReset();
    } catch (err) {
      logger.error("Credit reset scheduler error", err);
    }
  }, CHECK_INTERVAL);
}
