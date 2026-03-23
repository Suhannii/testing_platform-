/**
 * Route protection middleware (NextAuth)
 *
 * - All routes under /admin, /dashboard, /tests require a valid session.
 * - /admin routes additionally require the ADMIN role; other roles are
 *   redirected to /dashboard.
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Block non-admins from accessing admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow the request only when a valid JWT token exists
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply middleware to protected route groups only
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/tests/:path*"],
};
