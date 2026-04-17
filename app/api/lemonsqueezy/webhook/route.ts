import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { parseLemonSqueezyPayload, verifyLemonSqueezySignature, type PurchaseRecord } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const dbPath = path.join(process.cwd(), "data", "purchases.json");

async function readPurchases(): Promise<PurchaseRecord[]> {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw) as PurchaseRecord[];
  } catch {
    return [];
  }
}

async function savePurchases(purchases: PurchaseRecord[]) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(purchases, null, 2), "utf8");
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSqueezySignature(bodyText, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = parseLemonSqueezyPayload(body);

  if (!payload.success) {
    return NextResponse.json({ error: "Unexpected payload" }, { status: 422 });
  }

  if (payload.data.meta.event_name !== "order_created") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  const email = payload.data.data.attributes.user_email;
  if (!email) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 422 });
  }

  const record: PurchaseRecord = {
    orderId: payload.data.data.id,
    email,
    amountUsd: payload.data.data.attributes.total_usd ?? 19,
    status: payload.data.data.attributes.status ?? "paid",
    receiptId: payload.data.data.attributes.identifier ?? payload.data.data.id,
    purchasedAt: new Date().toISOString()
  };

  const purchases = await readPurchases();
  const existingIndex = purchases.findIndex((purchase) => purchase.orderId === record.orderId);

  if (existingIndex >= 0) {
    purchases[existingIndex] = record;
  } else {
    purchases.push(record);
  }

  await savePurchases(purchases);

  return NextResponse.json({ status: "ok" });
}
