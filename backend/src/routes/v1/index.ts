import { Router } from "express";
import { globalRateLimit } from "../../middleware/rateLimit.middleware";
import { authRouter } from "./auth.routes";
import { businessRouter } from "./businesses.routes";
import { campaignRouter } from "./campaigns.routes";
import { auditRouter } from "./audits.routes";
import { creativeRouter } from "./creatives.routes";
import { competitorRouter } from "./competitors.routes";
import { whatsappRouter } from "./whatsapp.routes";
import { growthRouter } from "./growth.routes";
import { billingRouter } from "./billing.routes";
import { teamRouter } from "./teams.routes";
import { notificationRouter } from "./notifications.routes";
import { jobRouter } from "./jobs.routes";
import { creditRouter } from "./credits.routes";

export const v1Router = Router();

v1Router.use(globalRateLimit);

v1Router.use("/auth", authRouter);
v1Router.use("/businesses", businessRouter);
v1Router.use("/campaigns", campaignRouter);
v1Router.use("/audits", auditRouter);
v1Router.use("/creatives", creativeRouter);
v1Router.use("/competitors", competitorRouter);
v1Router.use("/whatsapp", whatsappRouter);
v1Router.use("/growth", growthRouter);
v1Router.use("/billing", billingRouter);
v1Router.use("/teams", teamRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/jobs", jobRouter);
v1Router.use("/credits", creditRouter);
