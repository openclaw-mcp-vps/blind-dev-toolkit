import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { checkoutId?: string };

  if (!body.checkoutId || body.checkoutId.length < 4) {
    return NextResponse.json({ error: "Invalid checkout confirmation." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "bdt_access",
    value: "granted",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 31
  });

  return response;
}
