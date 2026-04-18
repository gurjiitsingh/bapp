import { NextResponse } from "next/server";

export function middleware(req: any) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // just redirect blindly for now
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};