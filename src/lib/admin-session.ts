import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-constants";
import { getJwtSecret } from "@/lib/jwt-secret";

export async function jsonWithAdminSession(
  adminId: string,
  username: string
): Promise<NextResponse> {
  const token = await new SignJWT({
    sub: adminId,
    u: username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecret());

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
