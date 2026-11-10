import bcrypt from "bcryptjs";
import { ensureSeeded, sql } from "@/lib/db";
import { json } from "@/lib/server/authz";
import { mintStaffToken, staffCookieHeader } from "@/lib/server/staff-session";
import { sanitizeText } from "@/lib/security/validate";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = sanitizeText(body.email, 160).toLowerCase();
  const password = String(body.password || "");
  if (!email || password.length < 8) {
    return json({ error: "invalid_credentials" }, 400);
  }

  const rows = await sql<{
    viewer_sub: string;
    email: string;
    full_name: string;
    role: "admin" | "housekeeping";
    active: boolean | number | string;
    password_hash: string;
  }>(
    `select viewer_sub, email, full_name, role, active, password_hash
     from staff_profiles where lower(email) = lower($1) limit 1`,
    [email]
  );
  const user = rows[0];
  const active = user?.active === true || user?.active === 1 || user?.active === "1";
  if (!user || !active || !user.password_hash) {
    return json({ error: "invalid_credentials" }, 401);
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return json({ error: "invalid_credentials" }, 401);

  const token = await mintStaffToken({
    sub: user.viewer_sub,
    email: user.email,
    name: user.full_name,
    role: user.role,
  });

  return json(
    { ok: true, role: user.role, name: user.full_name, email: user.email },
    200,
    { "set-cookie": staffCookieHeader(token) }
  );
}
