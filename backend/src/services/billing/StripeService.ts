import Stripe from "stripe";
import { config } from "../../config";
import { AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";

const stripe = new Stripe(config.stripe.secretKey);

export class StripeService {
  async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    return stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async handleWebhook(body: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    } catch {
      throw new AppError(401, "INVALID_SIGNATURE", "Invalid Stripe webhook signature");
    }

    logger.info(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
    // TODO: Sync subscription state to DB
    logger.info("Stripe subscription changed", { id: subscription.id });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // TODO: Cancel subscription in DB
    logger.info("Stripe subscription deleted", { id: subscription.id });
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    // TODO: Record payment, grant monthly credits
    logger.info("Stripe invoice paid", { id: invoice.id });
  }
}

export const stripeService = new StripeService();
