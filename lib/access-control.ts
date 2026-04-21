import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "bdt_access";

export type AccessPayload = {
  email: string;
  issuedAt: number;
  expiresAt: number;
};

function getAccessSecret() {
  return (
    process.env.ACCESS_COOKIE_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "blind-dev-toolkit-change-this-secret"
  );
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getAccessSecret())
    .update(value)
    .digest("base64url");
}

export function createAccessToken(email: string, maxAgeDays = 30) {
  const now = Date.now();
  const payload: AccessPayload = {
    email: email.trim().toLowerCase(),
    issuedAt: now,
    expiresAt: now + maxAgeDays * 24 * 60 * 60 * 1000
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const signaturesMatch = crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!signaturesMatch) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AccessPayload;
    if (!payload.email || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
