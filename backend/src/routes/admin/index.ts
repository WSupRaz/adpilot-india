import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/rbac.middleware";
import { adminUsersRouter } from "./users.routes";
import { adminRevenueRouter } from "./revenue.routes";
import { adminSystemRouter } from "./system.routes";

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/revenue", adminRevenueRouter);
adminRouter.use("/system", adminSystemRouter);
