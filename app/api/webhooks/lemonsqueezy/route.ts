import { NextRequest, NextResponse } from "next/server";
import {
  upsertEntitlement,
  verifyStripeWebhookSignature
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: {
      customer_email?: string;
      customer?: string;
      customer_details?: {
        email?: string;
      };
      billing_details?: {
        email?: string;
      };
    };
  };
};

function pickEmail(event: StripeEvent) {
  return (
    event.data.object.customer_details?.email ||
    event.data.object.customer_email ||
    event.data.object.billing_details?.email ||
    ""
  )
    .trim()
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const signatureValid = verifyStripeWebhookSignature(
    payload,
    signature,
    secret
  );

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = pickEmail(event);
  if (!email) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await upsertEntitlement({
      email,
      source: "stripe",
      status: "active",
      purchasedAt: new Date(event.created * 1000).toISOString(),
      customerId: event.data.object.customer,
      lastEventId: event.id
    });
  }

  if (
    event.type === "charge.refunded" ||
    event.type === "checkout.session.expired"
  ) {
    await upsertEntitlement({
      email,
      source: "stripe",
      status: "revoked",
      purchasedAt: new Date(event.created * 1000).toISOString(),
      customerId: event.data.object.customer,
      lastEventId: event.id
    });
  }

  return NextResponse.json({ received: true });
}
