import { NextRequest, NextResponse } from "next/server";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSqueezyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
