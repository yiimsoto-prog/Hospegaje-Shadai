import { ensureSeeded, sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";
import { getCachedHotel, setCachedHotel } from "@/lib/server/content-store";
import { sanitizeText } from "@/lib/security/validate";
import type { HotelInfo } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await requireStaff(request, ["admin"]);
  if (auth instanceof Response) return auth;
  return json({ hotel: getCachedHotel() });
}

export async function PUT(request: Request) {
  const auth = await requireStaff(request, ["admin"]);
  if (auth instanceof Response) return auth;

  try {
    await ensureSeeded();
    const body = (await request.json()) as Partial<HotelInfo>;
    const current = getCachedHotel();

    const phones = Array.isArray(body.phones)
      ? body.phones
          .slice(0, 6)
          .map((p) => ({
            number: sanitizeText(p.number, 32),
            label: sanitizeText(p.label, 64),
            whatsapp: sanitizeText(p.whatsapp, 32).replace(/\D/g, ""),
          }))
          .filter((p) => p.number)
      : current.phones;

    const galleryPhotos = Array.isArray(body.galleryPhotos)
      ? body.galleryPhotos.map((u) => sanitizeText(u, 500)).filter(Boolean).slice(0, 12)
      : current.galleryPhotos;

    const next: HotelInfo = {
      name: sanitizeText(body.name ?? current.name, 80) || current.name,
      tagline: sanitizeText(body.tagline ?? current.tagline, 120),
      city: sanitizeText(body.city ?? current.city, 120),
      address: sanitizeText(body.address ?? current.address, 200),
      email: sanitizeText(body.email ?? current.email, 120),
      phones,
      currency: sanitizeText(body.currency ?? current.currency, 8) || "S/",
      wifiNetwork: sanitizeText(body.wifiNetwork ?? current.wifiNetwork, 64),
      wifiPassword: sanitizeText(body.wifiPassword ?? current.wifiPassword, 64),
      wifiPasswordHint: sanitizeText(body.wifiPasswordHint ?? current.wifiPasswordHint, 120),
      checkoutHour: sanitizeText(body.checkoutHour ?? current.checkoutHour, 8) || "11:00",
      heroPhoto: sanitizeText(body.heroPhoto ?? current.heroPhoto, 500),
      galleryPhotos,
    };

    setCachedHotel(next);

    const contentJson = JSON.stringify({
      wifiPassword: next.wifiPassword,
      wifiPasswordHint: next.wifiPasswordHint,
      heroPhoto: next.heroPhoto,
      galleryPhotos: next.galleryPhotos,
    });

    try {
      await sql(
        `update hotel_settings set
          name = $1, tagline = $2, city = $3, address = $4, email = $5,
          phones = $6, wifi_network = $7, checkout_hour = $8, currency = $9
         where id = 1`,
        [
          next.name,
          next.tagline,
          next.city,
          next.address,
          next.email,
          JSON.stringify(next.phones),
          next.wifiNetwork,
          next.checkoutHour,
          next.currency,
        ]
      );
    } catch {
      // memory / limited drivers may reject — cache still updated
    }

    // Best-effort optional columns
    try {
      await sql(`update hotel_settings set wifi_password = $1, content_json = $2 where id = 1`, [
        next.wifiPassword,
        contentJson,
      ]);
    } catch {
      /* optional */
    }

    return json({ ok: true, hotel: next });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "save_failed" }, 500);
  }
}
