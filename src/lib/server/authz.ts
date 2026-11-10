import {
  getIdentity,
  requireTeamRole,
  type Identity,
} from "../../../cursor/identity";
import { ensureSeeded, sql } from "@/lib/db";
import { readStaffToken } from "@/lib/server/staff-session";
import { getStaffBySub, staffCount, upsertStaff } from "@/lib/server/staff-store";

export type StaffRole = "admin" | "housekeeping";

export type StaffSession = {
  identity: Identity & { verified: true };
  role: StaffRole | null;
  canBootstrap: boolean;
  authMode: "cursor" | "password";
};

function passwordIdentity(claims: {
  sub: string;
  email: string;
  name: string;
}): Identity & { verified: true } {
  return {
    verified: true,
    simulated: false,
    token: "",
    sub: claims.sub,
    email: claims.email,
    emailVerified: true,
    name: claims.name,
    idp: { provider: "cursor", sub: claims.sub },
    stage: "production",
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    claims: {},
    kind: "person",
    userId: 0,
    appVisibility: "private",
  };
}

async function dbStaffCount(): Promise<number> {
  try {
    const countRows = await sql<{ c: number | string }>(`select count(*) as c from staff_profiles`);
    return Number(countRows[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

async function loadProfile(sub: string): Promise<{ role: StaffRole; active: boolean } | null> {
  const cached = getStaffBySub(sub);
  if (cached) return { role: cached.role, active: cached.active };

  try {
    const rows = await sql<{
      role: StaffRole;
      active: boolean | number | string;
      email?: string;
      full_name?: string;
      password_hash?: string;
      viewer_sub?: string;
    }>(`select role, active, email, full_name, password_hash, viewer_sub from staff_profiles where viewer_sub = $1 limit 1`, [
      sub,
    ]);
    const profile = rows[0];
    if (!profile) return null;
    const active = profile.active === true || profile.active === 1 || profile.active === "1";
    if (profile.viewer_sub || profile.email) {
      upsertStaff({
        viewer_sub: String(profile.viewer_sub || sub),
        email: String(profile.email || ""),
        full_name: String(profile.full_name || ""),
        role: profile.role,
        active,
        password_hash: String(profile.password_hash || ""),
      });
    }
    return { role: profile.role, active };
  } catch {
    return null;
  }
}

export async function loadStaffSession(request: Request): Promise<StaffSession | Response> {
  await ensureSeeded();

  const dbCount = await dbStaffCount();
  const canBootstrap = dbCount === 0 && staffCount() === 0;

  // 1) Password / JWT session (Cloudflare public Worker)
  const jwt = await readStaffToken(request);
  if (jwt) {
    const profile = await loadProfile(jwt.sub);
    // Trust JWT role if profile row is missing (memory reset / delayed DB) so refresh keeps session.
    const role = profile?.active ? profile.role : jwt.role;
    return {
      identity: passwordIdentity(jwt),
      role,
      canBootstrap: false,
      authMode: "password",
    };
  }

  // 2) Cursor app identity (private/team published apps)
  const soft = await getIdentity(request);
  if (soft.verified) {
    const profile = await loadProfile(soft.sub);
    const role = profile?.active ? profile.role : null;
    return {
      identity: soft as Identity & { verified: true },
      role,
      canBootstrap,
      authMode: "cursor",
    };
  }

  return Response.json(
    {
      error: "unauthorized",
      needsLogin: true,
      canBootstrap,
      message: canBootstrap
        ? "Crea el primer administrador con email y contraseña."
        : "Inicia sesión con email y contraseña de personal.",
    },
    { status: 401 }
  );
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

  if (session.authMode === "cursor") {
    const admin = requireTeamRole(session.identity, ["admin"]);
    if (!(admin instanceof Response)) {
      return { identity: session.identity, role: "admin" };
    }
  }

  return Response.json({ error: "forbidden", message: "Sin permiso de personal" }, { status: 403 });
}

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "private, no-store",
      ...headers,
    },
  });
}
