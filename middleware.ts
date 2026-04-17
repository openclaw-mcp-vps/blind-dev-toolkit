import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/editor", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const hasAccess = request.cookies.get("bdt_paid")?.value === "true";
    if (!hasAccess) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("paywall", "required");
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*", "/dashboard/:path*"]
};
