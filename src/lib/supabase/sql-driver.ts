import roomsSeed from "@/lib/data/rooms-seed.json";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SqlRow = Record<string, unknown>;

function parseJsonFields<T extends SqlRow>(row: T): T {
  const out: SqlRow = { ...row };
  for (const key of ["phones", "amenities", "assignment", "charges", "payments"]) {
    const val = out[key];
    if (typeof val === "string") {
      try {
        out[key] = JSON.parse(val);
      } catch {
        /* keep */
      }
    }
  }
  return out as T;
}

/**
 * Minimal SQL → Supabase PostgREST adapter for the queries this app issues.
 */
export async function createSupabaseDriver(): Promise<{
  kind: "supabase";
  sql: <T extends SqlRow = SqlRow>(text: string, params?: unknown[]) => Promise<T[]>;
} | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  // Seed rooms once if empty
  const { count } = await client.from("rooms").select("id", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    await client.from("rooms").upsert(
      roomsSeed.map((r) => ({
        id: r.id,
        number: r.number,
        name: r.name,
        room_type: r.type,
        floor: r.floor,
        capacity: r.capacity,
        bed: r.bed,
        price_per_night: r.price_per_night,
        status: r.status,
        amenities: r.amenities ?? [],
        cleaning_notes: r.cleaning_notes ?? "",
        cleaning_state: r.cleaning_state ?? "limpio",
        assignment: null,
        current_booking_id: null,
      })),
      { onConflict: "id" }
    );
  }

  return {
    kind: "supabase",
    async sql<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
      const q = text.replace(/\s+/g, " ").trim();
      const lower = q.toLowerCase();

      if (/^select\s+1\b/.test(lower)) {
        return [{ ok: 1 }] as unknown as T[];
      }

      if (lower.includes("from hotel_settings")) {
        const { data, error } = await client.from("hotel_settings").select("*").eq("id", 1).limit(1);
        if (error) throw new Error(error.message);
        return (data || []).map((r) => parseJsonFields(r as SqlRow)) as T[];
      }

      if (lower.includes("from rooms") && lower.includes("where number")) {
        const { data, error } = await client
          .from("rooms")
          .select(lower.includes("assignment") && !lower.includes("select *") ? "assignment" : "*")
          .eq("number", String(params[0]))
          .limit(1);
        if (error) throw new Error(error.message);
        return (data || []).map((r) => parseJsonFields(r as SqlRow)) as T[];
      }

      if (lower.includes("from rooms")) {
        const { data, error } = await client.from("rooms").select("*").order("number");
        if (error) throw new Error(error.message);
        return (data || []).map((r) => parseJsonFields(r as SqlRow)) as T[];
      }

      if (lower.includes("from contratas") && lower.includes("where id")) {
        const { data, error } = await client.from("contratas").select("*").eq("id", String(params[0])).limit(1);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from contratas")) {
        const { data, error } = await client.from("contratas").select("*").order("razon_social");
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from pernoctas")) {
        const { data, error } = await client
          .from("pernoctas")
          .select("*")
          .order("checkout_at", { ascending: false })
          .limit(200);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from petty_cash")) {
        const { data, error } = await client
          .from("petty_cash")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from attendance")) {
        const { data, error } = await client
          .from("attendance")
          .select("*")
          .order("recorded_at", { ascending: false })
          .limit(200);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from housekeeping_tasks") && lower.includes("pendiente")) {
        const { data, error } = await client
          .from("housekeeping_tasks")
          .select("*")
          .eq("status", "pendiente")
          .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from staff_profiles") && lower.includes("viewer_sub =")) {
        const { data, error } = await client
          .from("staff_profiles")
          .select("role, active, password_hash, email, full_name, viewer_sub")
          .eq("viewer_sub", String(params[0]))
          .limit(1);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("from staff_profiles") && lower.includes("lower(email)")) {
        const { data, error } = await client
          .from("staff_profiles")
          .select("viewer_sub, email, full_name, role, active, password_hash")
          .eq("email", String(params[0]).toLowerCase())
          .limit(1);
        if (error) throw new Error(error.message);
        return (data || []) as T[];
      }

      if (lower.includes("count(*)") && lower.includes("staff_profiles")) {
        const { count, error } = await client
          .from("staff_profiles")
          .select("viewer_sub", { count: "exact", head: true });
        if (error) throw new Error(error.message);
        return [{ c: count ?? 0 }] as unknown as T[];
      }

      if (lower.startsWith("insert into staff_profiles")) {
        const row: Record<string, unknown> = {
          viewer_sub: String(params[0]),
          email: String(params[1] ?? ""),
          full_name: String(params[2] ?? ""),
          role: "admin",
          active: true,
        };
        if (params.length >= 4) row.password_hash = String(params[3] ?? "");
        const { error } = await client.from("staff_profiles").insert(row);
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("insert into attendance")) {
        const { error } = await client.from("attendance").insert({
          id: String(params[0]),
          staff_name: String(params[1]),
          staff_role: String(params[2]),
          mark_type: String(params[3]),
          note: String(params[4] ?? ""),
          sede: "Challhuahuacho",
        });
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("insert into petty_cash")) {
        const { error } = await client.from("petty_cash").insert({
          id: String(params[0]),
          entry_type: String(params[1]),
          category: String(params[2]),
          description: String(params[3]),
          amount: Number(params[4]),
          sede: "Challhuahuacho",
          created_by: String(params[5]),
        });
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("insert into housekeeping_tasks")) {
        const { error } = await client.from("housekeeping_tasks").insert({
          id: String(params[0]),
          room_number: String(params[1]),
          status: "pendiente",
          notes: lower.includes("liberación")
            ? "Liberación de guardia — limpieza profunda"
            : "Check-out móvil — aseo diario",
        });
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("insert into bookings")) {
        const { error } = await client.from("bookings").insert({
          id: String(params[0]),
          code: String(params[1]),
          room_number: String(params[2]),
          guest_name: String(params[3]),
          guest_doc: String(params[4]),
          check_in: String(params[5]),
          status: "activa",
          base_price: Number(params[6]),
          charges: [],
          payments: [],
        });
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("insert into pernoctas")) {
        const { error } = await client.from("pernoctas").insert({
          id: String(params[0]),
          ticket: String(params[1]),
          room_number: String(params[2]),
          dni: String(params[3]),
          worker_name: String(params[4]),
          contrata_name: String(params[5] ?? ""),
          night_date: String(params[6]),
          checkout_at: String(params[7]),
          tariff: Number(params[8]),
          validated: true,
        });
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("update rooms") && lower.includes("assignment")) {
        const patch: SqlRow = {
          updated_at: new Date().toISOString(),
        };
        if (lower.includes("status = 'ocupada'")) {
          patch.status = "ocupada";
          patch.cleaning_state = "limpio";
          patch.assignment =
            typeof params[1] === "string" ? JSON.parse(String(params[1])) : params[1];
        } else if (lower.includes("status = 'limpieza'")) {
          patch.status = "limpieza";
          patch.cleaning_state = "sucio";
          if (lower.includes("assignment = null")) {
            patch.assignment = null;
            patch.current_booking_id = null;
          } else {
            patch.assignment =
              typeof params[1] === "string" ? JSON.parse(String(params[1])) : params[1];
          }
        } else if (lower.includes("cleaning_state = 'limpio'")) {
          patch.status = String(params[1]);
          patch.cleaning_state = "limpio";
        }
        const { error } = await client.from("rooms").update(patch).eq("number", String(params[0]));
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("update rooms")) {
        const { error } = await client
          .from("rooms")
          .update({
            status: String(params[1]),
            cleaning_state: "limpio",
            updated_at: new Date().toISOString(),
          })
          .eq("number", String(params[0]));
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      if (lower.startsWith("update housekeeping_tasks")) {
        const { error } = await client
          .from("housekeeping_tasks")
          .update({ status: "completa" })
          .eq("room_number", String(params[0]))
          .eq("status", "pendiente");
        if (error) throw new Error(error.message);
        return [] as T[];
      }

      throw new Error(`Supabase driver: unsupported SQL: ${q.slice(0, 160)}`);
    },
  };
}
