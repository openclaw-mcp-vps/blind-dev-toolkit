import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/editor")) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get("bdt_access")?.value === "granted";
  if (!hasAccess) {
    const redirectUrl = new URL("/purchase/success", request.url);
    redirectUrl.searchParams.set("required", "1");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*"]
};
