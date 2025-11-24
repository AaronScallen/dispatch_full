import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the "dispatch_session" cookie exists
  const hasSession = request.cookies.has("dispatch_session");

  // If user tries to go to /admin AND doesn't have the cookie
  if (request.nextUrl.pathname.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
