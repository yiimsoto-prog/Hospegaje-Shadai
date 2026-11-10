import bcrypt from "bcryptjs";
import { ensureSeeded, sql } from "@/lib/db";
import { json } from "@/lib/server/authz";
import { mintStaffToken, staffCookieHeader } from "@/lib/server/staff-session";
import { getStaffByEmail, upsertStaff } from "@/lib/server/staff-store";
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

  let user = getStaffByEmail(email);

  if (!user) {
    try {
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
      const row = rows[0];
      if (row) {
        user = {
          viewer_sub: row.viewer_sub,
          email: row.email,
          full_name: row.full_name,
          role: row.role,
          active: row.active === true || row.active === 1 || row.active === "1",
          password_hash: row.password_hash,
        };
        upsertStaff(user);
      }
    } catch {
      /* fall through */
    }
  }

  if (!user || !user.active || !user.password_hash) {
    return json({ error: "invalid_credentials", message: "Email o contraseña incorrectos" }, 401);
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return json({ error: "invalid_credentials", message: "Email o contraseña incorrectos" }, 401);

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
