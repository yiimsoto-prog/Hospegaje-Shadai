import {
  getIdentity,
  requireIdentity,
  requireTeamRole,
  type Identity,
} from "../../../cursor/identity";
import { ensureSeeded, sql } from "@/lib/db";

export type StaffRole = "admin" | "housekeeping";

export type StaffSession = {
  identity: Identity & { verified: true };
  role: StaffRole | null;
  canBootstrap: boolean;
};

export async function loadStaffSession(request: Request): Promise<StaffSession | Response> {
  await ensureSeeded();
  // Prefer soft getIdentity so public Cloudflare guest traffic does not hard-fail.
  const soft = await getIdentity(request);
  const identity = soft.verified
    ? soft
    : await requireIdentity(request);
  if (identity instanceof Response) return identity;
  if (!("verified" in identity) || !identity.verified) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await sql<{ role: StaffRole; active: boolean | number | string }>(
    `select role, active from staff_profiles where viewer_sub = $1 limit 1`,
    [identity.sub]
  );
  const profile = rows[0];
  const active = profile?.active === true || profile?.active === 1 || profile?.active === "1";
  const role = active ? profile!.role : null;

  const countRows = await sql<{ c: number | string }>(`select count(*) as c from staff_profiles`);
  const canBootstrap = Number(countRows[0]?.c ?? 0) === 0;

  return { identity: identity as Identity & { verified: true }, role, canBootstrap };
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
