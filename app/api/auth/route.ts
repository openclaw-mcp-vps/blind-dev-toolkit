import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_MAX_AGE,
  ACCESS_COOKIE_NAME,
  createAccessToken,
  hasPurchaseForEmail,
  verifyAccessToken
} from "@/lib/paywall";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const payload = verifyAccessToken(token);

  return NextResponse.json({
    authenticated: Boolean(payload),
    email: payload?.email ?? null
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Enter a valid purchase email address."
      },
      { status: 400 }
    );
  }

  const hasPurchase = await hasPurchaseForEmail(email);
  if (!hasPurchase) {
    return NextResponse.json(
      {
        authenticated: false,
        message:
          "No completed Stripe purchase was found for this email yet. If checkout was recent, wait one minute for webhook delivery and try again."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    authenticated: true,
    email
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: createAccessToken(email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  return response;
}

export function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
