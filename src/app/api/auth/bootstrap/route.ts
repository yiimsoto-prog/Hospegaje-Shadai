import { json, loadStaffSession } from "@/lib/server/authz";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const session = await loadStaffSession(request);
  if (session instanceof Response) return session;
  if (!session.canBootstrap) {
    return json({ error: "already_bootstrapped" }, 409);
  }

  await sql(
    `insert into staff_profiles (viewer_sub, email, full_name, role, active)
     values ($1, $2, $3, 'admin', true)`,
    [
      session.identity.sub,
      session.identity.email || "",
      session.identity.name || "Administrador",
    ]
  );

  return json({ ok: true, role: "admin" });
}
