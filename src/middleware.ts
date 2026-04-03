import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, getJwtSecret());
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        const res = NextResponse.next();
        res.cookies.delete(ADMIN_TOKEN_COOKIE);
        return res;
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete(ADMIN_TOKEN_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
