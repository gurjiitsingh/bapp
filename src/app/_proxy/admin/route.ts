import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Allow login and logout pages
  if (pathname.startsWith("/admin/login") || pathname === "/logout") {
    return NextResponse.rewrite(url);
  }

  // Allow NextAuth API calls
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check session
  const session = await auth({ req });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Forward to the requested admin page
  return NextResponse.rewrite(url);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
