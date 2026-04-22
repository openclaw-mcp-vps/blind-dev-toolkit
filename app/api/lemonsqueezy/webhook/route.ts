import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordPurchase } from "@/lib/paywall";

type StripeSignatureParts = {
  timestamp: string;
  signatures: string[];
};

type StripeWebhookEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      amount_total?: number;
      currency?: string;
      customer?: string;
      customer_email?: string;
      customer_details?: {
        email?: string;
      };
    };
  };
};

function parseStripeSignature(value: string): StripeSignatureParts | null {
  const parts = value.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

function signatureMatches(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function verifyStripeSignature(rawBody: string, header: string, secret: string): boolean {
  const parsed = parseStripeSignature(header);
  if (!parsed) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  return parsed.signatures.some((provided) => signatureMatches(expected, provided));
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const signatureHeader = request.headers.get("stripe-signature");
  if (!signatureHeader) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeWebhookEvent;

  if (event.type === "checkout.session.completed") {
    const object = event.data?.object;
    const email = object?.customer_details?.email ?? object?.customer_email;

    if (!email) {
      return NextResponse.json({ received: true, recorded: false, reason: "missing customer email" });
    }

    await recordPurchase({
      email,
      provider: "stripe",
      eventId: object?.id ?? event.id ?? `stripe-${Date.now()}`,
      amountTotal: object?.amount_total,
      currency: object?.currency,
      customerId: object?.customer,
      paidAt: new Date().toISOString()
    });

    return NextResponse.json({ received: true, recorded: true, email });
  }

  return NextResponse.json({ received: true, recorded: false, ignoredType: event.type ?? "unknown" });
}
