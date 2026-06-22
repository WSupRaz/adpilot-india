import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Forward verified payload to backend webhook handler
  const response = await fetch(`${process.env.API_URL}/api/v1/billing/webhooks/razorpay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-webhook-verified": "true" },
    body,
  });

  return NextResponse.json({ received: true }, { status: response.status });
}
