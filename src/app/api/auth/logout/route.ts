import { json } from "@/lib/server/authz";
import { clearStaffCookieHeader } from "@/lib/server/staff-session";

export async function POST() {
  return json({ ok: true }, 200, { "set-cookie": clearStaffCookieHeader() });
}
