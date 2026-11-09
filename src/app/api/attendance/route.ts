import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";

export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin", "housekeeping"]);
  if (staff instanceof Response) return staff;
  const body = (await request.json()) as {
    staff_name?: string;
    role?: string;
    type?: "entrada" | "salida";
    note?: string;
  };
  if (!body.staff_name?.trim() || !body.role?.trim() || !body.type) {
    return json({ error: "invalid_input" }, 400);
  }
  await sql(
    `insert into attendance (id, staff_name, staff_role, mark_type, note, sede)
     values ($1,$2,$3,$4,$5,'Challhuahuacho')`,
    [randomUUID(), body.staff_name.trim(), body.role.trim(), body.type, body.note?.trim() || ""]
  );
  return json({ ok: true });
}
