import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

export const billingRouter = Router();

// Webhook routes (no auth — validated by signature)
billingRouter.post("/webhooks/razorpay", async (req, res) => {
  // TODO: RazorpayService.handleWebhook(req.body, req.headers)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

billingRouter.post("/webhooks/stripe", async (req, res) => {
  // TODO: StripeService.handleWebhook(req.body, req.headers)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

// Protected routes
billingRouter.use(authenticate);

billingRouter.get("/subscription", async (req, res) => {
  // TODO: BillingService.getSubscription(req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

billingRouter.post("/checkout", async (req, res) => {
  // TODO: RazorpayService.createSubscriptionOrder(req.userId, req.body.planId, req.body.cycle)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

billingRouter.post("/cancel", async (req, res) => {
  // TODO: BillingService.cancelSubscription(req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

billingRouter.get("/invoices", async (req, res) => {
  // TODO: InvoiceService.list(req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

billingRouter.get("/plans", async (_req, res) => {
  // TODO: PlanService.listActive()
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
