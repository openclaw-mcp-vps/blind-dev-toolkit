import crypto from "crypto";
import { z } from "zod";

const orderPayloadSchema = z.object({
  meta: z.object({
    event_name: z.string()
  }),
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
      user_email: z.string().email().optional(),
      total_usd: z.number().optional(),
      status: z.string().optional(),
      identifier: z.string().optional()
    })
  })
});

export type PurchaseRecord = {
  orderId: string;
  email: string;
  amountUsd: number;
  status: string;
  receiptId: string;
  purchasedAt: string;
};

export function verifyLemonSqueezySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function parseLemonSqueezyPayload(payload: unknown) {
  return orderPayloadSchema.safeParse(payload);
}

export function getCheckoutOverlayUrl() {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!productId) return null;

  const query = new URLSearchParams({
    embed: "1",
    media: "0",
    logo: "0",
    checkout: "true"
  });

  return `https://app.lemonsqueezy.com/checkout/buy/${productId}?${query.toString()}`;
}
