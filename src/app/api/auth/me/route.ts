import { json, loadStaffSession } from "@/lib/server/authz";

export async function GET(request: Request) {
  const session = await loadStaffSession(request);
  if (session instanceof Response) return session;
  return json({
    name: session.identity.name || session.identity.email || "Personal",
    email: session.identity.email,
    role: session.role,
    canBootstrap: session.canBootstrap,
    teamRole:
      session.identity.appVisibility === "team" ? session.identity.teamRole : null,
  });
}
