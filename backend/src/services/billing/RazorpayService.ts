import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../../config";
import { AppError } from "../../lib/errors";
import { prisma } from "../../config/database";
import { logger } from "../../lib/logger";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class RazorpayService {
  async createOrder(amountPaise: number, currency = "INR", notes?: object) {
    return razorpay.orders.create({
      amount: amountPaise,
      currency,
      notes,
    });
  }

  async createSubscription(planId: string, userId: string) {
    return razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      notes: { userId },
    });
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return expected === signature;
  }

  async handleWebhook(body: unknown, headers: Record<string, string>) {
    const signature = headers["x-razorpay-signature"];
    const bodyString = JSON.stringify(body);

    const expected = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(bodyString)
      .digest("hex");

    if (expected !== signature) {
      throw new AppError(401, "INVALID_SIGNATURE", "Invalid Razorpay webhook signature");
    }

    const event = body as { event: string; payload: any };
    logger.info(`Razorpay webhook: ${event.event}`);

    switch (event.event) {
      case "payment.captured":
        await this.handlePaymentCaptured(event.payload);
        break;
      case "subscription.activated":
        await this.handleSubscriptionActivated(event.payload);
        break;
      case "subscription.cancelled":
        await this.handleSubscriptionCancelled(event.payload);
        break;
      default:
        logger.info(`Unhandled Razorpay event: ${event.event}`);
    }
  }

  private async handlePaymentCaptured(payload: any) {
    // TODO: Update payment record, grant credits if credit top-up
    logger.info("Payment captured", { paymentId: payload.payment?.entity?.id });
  }

  private async handleSubscriptionActivated(payload: any) {
    // TODO: Activate subscription, grant monthly credits
    logger.info("Subscription activated", { subscriptionId: payload.subscription?.entity?.id });
  }

  private async handleSubscriptionCancelled(payload: any) {
    // TODO: Cancel subscription in DB
    logger.info("Subscription cancelled", { subscriptionId: payload.subscription?.entity?.id });
  }
}

export const razorpayService = new RazorpayService();
