// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Define paths that don't require authentication
  const publicPaths = ["/", "/login"];

  // 2. Check for the session cookie
  // Better Auth uses "better-auth.session_token" by default
  // (In production with HTTPS, it might be "__Secure-better-auth.session_token")
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // 3. Logic:

  // A. If user is trying to access a protected route AND has no cookie -> Redirect to login
  const isPublicPath = publicPaths.includes(path);
  if (!isPublicPath && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. If user is ALREADY logged in and tries to go to /login -> Redirect to dashboard
  if (isPublicPath && sessionCookie && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // C. Otherwise, let them pass
  return NextResponse.next();
}

// 4. Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files, images, and the API (very important for auth to work!)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
