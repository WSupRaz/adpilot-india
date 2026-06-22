import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { notificationService } from "../../services/NotificationService";
import { success } from "../../lib/response";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const notifications = await notificationService.list(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return success(res, notifications, 200, { unread_count: unreadCount });
  } catch (err) {
    next(err);
  }
});

notificationRouter.post("/read-all", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    await notificationService.markAllRead(userId);
    return success(res, { message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

notificationRouter.patch("/:id/read", async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    await notificationService.markRead(req.params.id, userId);
    return success(res, { message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
});
