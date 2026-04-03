import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-constants";
import { getJwtSecret } from "@/lib/jwt-secret";

export { ADMIN_TOKEN_COOKIE } from "@/lib/admin-constants";

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export function adminJsonResponse(message: string, status = 401) {
  return Response.json({ error: message }, { status });
}
