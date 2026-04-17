import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { PurchaseRecord } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const verifySchema = z.object({
  email: z.string().email(),
  orderId: z.string().min(2)
});

const dbPath = path.join(process.cwd(), "data", "purchases.json");

async function readPurchases(): Promise<PurchaseRecord[]> {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw) as PurchaseRecord[];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = verifySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }

  const purchases = await readPurchases();

  const found = purchases.find(
    (purchase) =>
      purchase.orderId === parsed.data.orderId &&
      purchase.email.toLowerCase() === parsed.data.email.toLowerCase() &&
      purchase.status.toLowerCase() !== "refunded"
  );

  if (!found) {
    return NextResponse.json(
      {
        error:
          "Purchase not found yet. If you just checked out, wait 10-20 seconds for webhook delivery and try again."
      },
      { status: 404 }
    );
  }

  const response = NextResponse.json({ status: "ok" });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("bdt_paid", "true", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  response.cookies.set("bdt_paid_email", parsed.data.email, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
