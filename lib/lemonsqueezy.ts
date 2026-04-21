import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type EntitlementStatus = "active" | "revoked";

export type Entitlement = {
  email: string;
  source: "stripe";
  status: EntitlementStatus;
  purchasedAt: string;
  updatedAt: string;
  customerId?: string;
  lastEventId?: string;
};

type EntitlementStore = {
  entitlements: Entitlement[];
};

const storePath = path.join(process.cwd(), ".data", "entitlements.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    const initial: EntitlementStore = { entitlements: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<EntitlementStore> {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as EntitlementStore;
}

async function writeStore(store: EntitlementStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function hasActiveEntitlement(email: string) {
  const store = await readStore();
  const normalized = email.trim().toLowerCase();
  return store.entitlements.some(
    (entry) => entry.email === normalized && entry.status === "active"
  );
}

export async function upsertEntitlement(record: Omit<Entitlement, "updatedAt">) {
  const store = await readStore();
  const normalizedEmail = record.email.trim().toLowerCase();

  const index = store.entitlements.findIndex(
    (entry) => entry.email === normalizedEmail && entry.source === record.source
  );

  const completeRecord: Entitlement = {
    ...record,
    email: normalizedEmail,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    store.entitlements[index] = {
      ...store.entitlements[index],
      ...completeRecord
    };
  } else {
    store.entitlements.push(completeRecord);
  }

  await writeStore(store);
  return completeRecord;
}

export function getStripePaymentLink() {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
}

function parseStripeSignatureHeader(signatureHeader: string) {
  const values = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) {
      return acc;
    }

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(value);
    return acc;
  }, {});

  const timestamp = Number(values.t?.[0]);
  const signatures = values.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
) {
  if (!signatureHeader) {
    return false;
  }

  const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - parsed.timestamp);
  if (ageSeconds > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return parsed.signatures.some((candidate) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}
