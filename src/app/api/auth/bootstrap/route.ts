import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/server/authz";
import { ensureSeeded, sql } from "@/lib/db";
import { mintStaffToken, staffCookieHeader } from "@/lib/server/staff-session";
import { sanitizeText } from "@/lib/security/validate";
import { getIdentity } from "../../../../../cursor/identity";

/**
 * First admin bootstrap for Cloudflare (email+password) or Cursor identity.
 */
export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    fullName?: string;
  };

  const countRows = await sql<{ c: number | string }>(`select count(*) as c from staff_profiles`);
  if (Number(countRows[0]?.c ?? 0) > 0) {
    return json({ error: "already_bootstrapped" }, 409);
  }

  const soft = await getIdentity(request);
  const hasCursor = soft.verified;

  const email = sanitizeText(body.email || (hasCursor ? soft.email : ""), 160).toLowerCase();
  const fullName = sanitizeText(
    body.fullName || (hasCursor ? soft.name || "Administrador" : "Administrador"),
    120
  );
  const password = String(body.password || "");

  if (!email) return json({ error: "email_required" }, 400);
  if (password.length < 8) return json({ error: "password_min_8" }, 400);

  const viewerSub = hasCursor ? soft.sub : `staff:${randomUUID()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  await sql(
    `insert into staff_profiles (viewer_sub, email, full_name, role, active, password_hash)
     values ($1, $2, $3, 'admin', true, $4)`,
    [viewerSub, email, fullName, passwordHash]
  );

  const token = await mintStaffToken({
    sub: viewerSub,
    email,
    name: fullName,
    role: "admin",
  });

  return json(
    { ok: true, role: "admin", email, name: fullName },
    200,
    { "set-cookie": staffCookieHeader(token) }
  );
}
