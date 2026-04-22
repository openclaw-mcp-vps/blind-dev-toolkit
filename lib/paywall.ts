import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const ACCESS_COOKIE_NAME = "bdt_access";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type AccessTokenPayload = {
  email: string;
  exp: number;
};

export type PurchaseRecord = {
  email: string;
  provider: "stripe";
  eventId: string;
  paidAt: string;
  amountTotal?: number;
  currency?: string;
  customerId?: string;
};

const purchasesFile = path.join(process.cwd(), "data", "purchases.json");

function getSigningSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "dev-only-change-me";
}

function createSignature(input: string): string {
  return createHmac("sha256", getSigningSecret()).update(input).digest("hex");
}

async function ensurePurchasesStore(): Promise<void> {
  await mkdir(path.dirname(purchasesFile), { recursive: true });

  try {
    await readFile(purchasesFile, "utf8");
  } catch {
    await writeFile(purchasesFile, "[]", "utf8");
  }
}

export async function readPurchases(): Promise<PurchaseRecord[]> {
  await ensurePurchasesStore();

  try {
    const raw = await readFile(purchasesFile, "utf8");
    const parsed = JSON.parse(raw) as PurchaseRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function hasPurchaseForEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const purchases = await readPurchases();
  return purchases.some((purchase) => purchase.email.toLowerCase() === normalized);
}

export async function recordPurchase(purchase: PurchaseRecord): Promise<void> {
  const purchases = await readPurchases();

  const existingIndex = purchases.findIndex(
    (entry) => entry.eventId === purchase.eventId || entry.email.toLowerCase() === purchase.email.toLowerCase()
  );

  if (existingIndex >= 0) {
    purchases[existingIndex] = {
      ...purchases[existingIndex],
      ...purchase
    };
  } else {
    purchases.push(purchase);
  }

  await writeFile(purchasesFile, JSON.stringify(purchases, null, 2), "utf8");
}

export function createAccessToken(email: string): string {
  const payload: AccessTokenPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ACCESS_COOKIE_MAX_AGE * 1000
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(encoded);

  return `${encoded}.${signature}`;
}

export function verifyAccessToken(token?: string | null): AccessTokenPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encoded, providedSignature] = token.split(".");
  if (!encoded || !providedSignature) {
    return null;
  }

  const expectedSignature = createSignature(encoded);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AccessTokenPayload;
    if (!payload.email || typeof payload.exp !== "number") {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
