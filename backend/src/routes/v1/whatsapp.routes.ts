import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

export const whatsappRouter = Router();

// WABA webhook verification (GET) and event handling (POST)
whatsappRouter.get("/webhook", async (req, res) => {
  // TODO: WhatsAppService.verifyWebhook(req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

whatsappRouter.post("/webhook", async (req, res) => {
  // TODO: WhatsAppService.handleIncoming(req.body)
  res.status(200).send("EVENT_RECEIVED"); // WhatsApp requires 200 immediately
});

// Protected routes
whatsappRouter.use(authenticate);

whatsappRouter.get("/leads", async (req, res) => {
  // TODO: WhatsAppService.listLeads(req.userId, req.query)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

whatsappRouter.get("/leads/:id/conversation", async (req, res) => {
  // TODO: WhatsAppService.getConversation(req.params.id, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});

whatsappRouter.post("/leads/:id/send", async (req, res) => {
  // TODO: WhatsAppService.sendMessage(req.params.id, req.body.message, req.userId)
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
});
