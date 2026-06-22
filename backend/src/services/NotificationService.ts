import { prisma } from "../config/database";

type NotificationType =
  | "campaign_ready"
  | "audit_complete"
  | "campaign_live"
  | "lead_received"
  | "credit_low"
  | "payment_failed"
  | "team_invite";

export class NotificationService {
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    actionUrl?: string
  ) {
    return prisma.notification.create({
      data: { userId, type, title, body, actionUrl },
    });
  }

  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
