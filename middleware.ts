import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to login page without authentication
    if (path === "/login") {
      return NextResponse.next();
    }

    // Protect all other routes
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*",
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};