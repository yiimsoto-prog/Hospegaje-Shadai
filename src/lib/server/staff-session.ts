import { SignJWT, jwtVerify } from "jose";
import type { StaffRole } from "@/lib/server/authz";

export const STAFF_COOKIE = "shadai_staff";

export type StaffJwtClaims = {
  sub: string;
  email: string;
  name: string;
  role: StaffRole;
};

function secretKey() {
  // Prefer a stable dedicated secret. Do NOT use rotating API tokens as signing key.
  const raw =
    process.env.STAFF_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "hospedaje-shadai-stable-session-v1";
  return new TextEncoder().encode(raw);
}

export async function mintStaffToken(claims: StaffJwtClaims): Promise<string> {
  return new SignJWT({
    email: claims.email,
    name: claims.name,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("12h")
    .setIssuer("hospedaje-shadai")
    .setAudience("staff")
    .sign(secretKey());
}

export async function readStaffToken(request: Request): Promise<StaffJwtClaims | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${STAFF_COOKIE}=([^;]+)`));
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "hospedaje-shadai",
      audience: "staff",
    });
    const role = payload.role as StaffRole;
    if (role !== "admin" && role !== "housekeeping") return null;
    return {
      sub: String(payload.sub || ""),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role,
    };
  } catch {
    return null;
  }
}

export function staffCookieHeader(token: string, maxAgeSec = 60 * 60 * 12): string {
  const secure = process.env.NODE_ENV === "production" || Boolean(process.env.CF_PAGES) || true;
  return `${STAFF_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${
    secure ? "; Secure" : ""
  }`;
}

export function clearStaffCookieHeader(): string {
  return `${STAFF_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}
