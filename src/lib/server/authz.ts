import { requireIdentity, requireTeamRole, type Identity } from "../../../cursor/identity";
import { ensureSeeded, sql } from "@/lib/db";

export type StaffRole = "admin" | "housekeeping";

export type StaffSession = {
  identity: Identity & { verified: true };
  role: StaffRole | null;
  canBootstrap: boolean;
};

export async function loadStaffSession(request: Request): Promise<StaffSession | Response> {
  await ensureSeeded();
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  const rows = await sql<{ role: StaffRole; active: boolean }>(
    `select role, active from staff_profiles where viewer_sub = $1 limit 1`,
    [identity.sub]
  );
  const profile = rows[0];
  const role = profile?.active ? profile.role : null;

  const countRows = await sql<{ c: string }>(`select count(*)::text as c from staff_profiles`);
  const canBootstrap = Number(countRows[0]?.c ?? 0) === 0;

  return { identity, role, canBootstrap };
}

export async function requireStaff(
  request: Request,
  allowed: StaffRole[]
): Promise<{ identity: Identity & { verified: true }; role: StaffRole } | Response> {
  const session = await loadStaffSession(request);
  if (session instanceof Response) return session;

  if (session.role && allowed.includes(session.role)) {
    return { identity: session.identity, role: session.role };
  }

  // Team Cursor admins may operate staff modules without a prior staff row.
  const admin = requireTeamRole(session.identity, ["admin"]);
  if (!(admin instanceof Response)) {
    return { identity: session.identity, role: "admin" };
  }

  return Response.json({ error: "forbidden", message: "Sin permiso de personal" }, { status: 403 });
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "private, no-store" },
  });
}
