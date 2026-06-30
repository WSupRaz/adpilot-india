import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = process.env.GRANT_EMAIL ?? "demo@adpilotindia.com";
const AMOUNT = Number(process.env.GRANT_AMOUNT ?? 150);

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.error(`No user found with email: ${EMAIL}`);
    process.exit(1);
  }

  await prisma.credits.upsert({
    where: { userId: user.id },
    create: { userId: user.id, balance: AMOUNT, lifetimeUsed: 0 },
    update: { balance: AMOUNT },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: AMOUNT,
      type: "monthly_grant",
      description: "Manual credit grant — demo reset",
      balanceAfter: AMOUNT,
    },
  });

  console.log(`✅ Set ${EMAIL} credits to ${AMOUNT}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
