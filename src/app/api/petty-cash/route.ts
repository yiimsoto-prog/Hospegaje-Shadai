import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";

export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin"]);
  if (staff instanceof Response) return staff;
  const body = (await request.json()) as {
    type?: "ingreso" | "egreso";
    category?: string;
    description?: string;
    amount?: number;
  };
  const amount = Number(body.amount);
  if (!body.type || !body.category?.trim() || !body.description?.trim() || !(amount > 0)) {
    return json({ error: "invalid_input" }, 400);
  }
  await sql(
    `insert into petty_cash (id, entry_type, category, description, amount, sede, created_by)
     values ($1,$2,$3,$4,$5,'Challhuahuacho',$6)`,
    [
      randomUUID(),
      body.type,
      body.category.trim(),
      body.description.trim(),
      amount,
      staff.identity.name || staff.identity.email || "Admin",
    ]
  );
  return json({ ok: true });
}
