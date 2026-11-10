import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { CITY_GALLERY, MEDIA, ROOM_GALLERY } from "@/lib/data/media";
import { HOTEL } from "@/lib/data/hotel";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader variant="hero" />
      <main>
        <section className="relative isolate min-h-[100svh] overflow-hidden text-white">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.heroAndes}
              alt="Paisaje altoandino cerca de Challhuahuacho, Apurímac"
              className="hero-kenburns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.35)_0%,rgba(12,10,8,0.22)_45%,rgba(12,10,8,0.78)_100%)]" />
          </div>

          <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:pb-24">
            <p className="slide-up eyebrow text-[color-mix(in_oklab,var(--brass)_85%,white)]">
              Challhuahuacho · Cotabambas · Apurímac
            </p>
            <h1 className="font-display slide-up mt-4 max-w-4xl text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
              Hospedaje Shadai
            </h1>
            <p
              className="slide-up mt-5 max-w-xl text-base text-white/85 sm:text-lg"
              style={{ animationDelay: "90ms" }}
            >
              {HOTEL.tagline}. Habitaciones con cama 2 plazas, smart TV y agua caliente 24h en el
              corazón minero de Cotabambas.
            </p>
            <div className="slide-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "160ms" }}>
              <Link
                href="/guest/checkin"
                className="inline-flex h-12 items-center bg-[var(--brass)] px-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#1c1915] transition hover:brightness-110"
              >
                Check-in digital
              </Link>
              <a
                href="#habitaciones"
                className="inline-flex h-12 items-center border border-white/70 px-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#1c1915]"
              >
                Ver habitaciones
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Entrada", "15:00"],
              ["Salida", HOTEL.checkoutHour],
              ["Desde", "S/ 40 / noche"],
              ["Recepción", "24 horas"],
            ].map(([label, value]) => (
              <div key={label} className="fade-in">
                <p className="eyebrow">{label}</p>
                <p className="font-display mt-2 text-3xl text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="habitaciones" className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Galería · Habitaciones</p>
              <h2 className="font-display mt-3 text-4xl md:text-5xl">Camas, TV y confort</h2>
            </div>
            <p className="max-w-md text-sm text-[var(--text-muted)]">
              Simple Confort: cama 2 plazas, smart TV 50&quot;, calefactor, Wi‑Fi fibra y baño privado
              con agua caliente permanente.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROOM_GALLERY.map((item, i) => (
              <figure
                key={item.title}
                className="slide-up group overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </div>
                <figcaption className="p-4">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{item.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="bg-[var(--ink)] py-20 text-[var(--paper)] md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <p className="eyebrow text-[var(--brass)]">Challhuahuacho</p>
            <h2 className="font-display mt-3 max-w-3xl text-4xl md:text-5xl">
              La ciudad a 4.000 m: Andes, ruta minera y cielo limpio
            </h2>
            <p className="mt-5 max-w-2xl text-white/70">
              Imágenes de paisaje altoandino y pueblos de altura que evocan Cotabambas y el entorno
              de Challhuahuacho — puerta de Las Bambas y descanso para contratas.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {CITY_GALLERY.map((item, i) => (
                <figure key={item.title} className="relative overflow-hidden" style={{ minHeight: i === 0 ? 360 : 280 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                    <h3 className="font-display text-2xl text-white">{item.title}</h3>
                    <p className="text-sm text-white/75">{item.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="overflow-hidden border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.roomBed}
              alt="Habitación con cama confortable en Hospedaje Shadai"
              className="aspect-[5/4] w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="eyebrow">El hotel</p>
            <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
              Quietud altoandina y hospitalidad clara
            </h2>
            <p className="mt-5 text-[var(--text-muted)] md:text-lg">
              En Challhuahuacho ofrecemos descanso reparador y operación confiable para equipos de
              contrata: check-in/out digital, liquidación B2B y recepción las 24 horas.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--text-muted)]">
              <li>· Wi‑Fi fibra óptica</li>
              <li>· Agua caliente 24h</li>
              <li>· Smart TV y calefactor</li>
              <li>· Check-out móvil con DNI</li>
            </ul>
            <Link
              href="/pms"
              className="mt-8 inline-flex h-12 items-center bg-[var(--ink)] px-6 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:bg-[var(--brass)] hover:text-[#1c1915]"
            >
              Abrir PMS / rack
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 md:grid-cols-2 md:pb-28">
          <div>
            <p className="eyebrow">Información útil</p>
            <h2 className="font-display mt-3 text-4xl">Cómo llegar y contactarnos</h2>
            <p className="mt-4 text-[var(--text-muted)]">{HOTEL.address}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {HOTEL.phones.map((p) => (
                <li key={p.number}>
                  <span className="font-semibold">{p.label}:</span>{" "}
                  <a
                    className="underline decoration-[var(--brass)] underline-offset-4"
                    href={`https://wa.me/${p.whatsapp}`}
                  >
                    {p.number}
                  </a>
                </li>
              ))}
              <li>
                <span className="font-semibold">Email:</span> {HOTEL.email}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.roomTv}
              alt="Habitación con televisor"
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.townStreet}
              alt="Calles de pueblo altoandino"
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.bathroom}
              alt="Baño privado del hotel"
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.valleyDusk}
              alt="Atardecer en los Andes de Apurímac"
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-10 text-center">
          <p className="font-display text-2xl">
            Hospedaje <span className="text-[var(--brass)]">Shadai</span>
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {HOTEL.city} · {HOTEL.tagline}
          </p>
        </footer>
      </main>
    </div>
  );
}
