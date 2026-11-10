import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { HOTEL } from "@/lib/data/hotel";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader variant="hero" />
      <main>
        {/* Hero: brand + one headline + one sentence + CTA + full-bleed image */}
        <section className="relative isolate min-h-[100svh] overflow-hidden text-white">
          <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt=""
              className="hero-kenburns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.35)_0%,rgba(12,10,8,0.25)_40%,rgba(12,10,8,0.72)_100%)]" />
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
              {HOTEL.tagline}. Descanso altoandino con agua caliente 24h, Wi‑Fi fibra y operación
              pensada para contratas mineras.
            </p>
            <div className="slide-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "160ms" }}>
              <Link
                href="/guest/checkin"
                className="inline-flex h-12 items-center bg-[var(--brass)] px-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#1c1915] transition hover:brightness-110"
              >
                Check-in digital
              </Link>
              <Link
                href="/pms"
                className="inline-flex h-12 items-center border border-white/70 px-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#1c1915]"
              >
                Ver habitaciones
              </Link>
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

        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">El hotel</p>
            <h2 className="font-display mt-4 text-4xl leading-tight md:text-5xl">
              Quietud altoandina, proporción y hospitalidad clara
            </h2>
            <p className="mt-5 text-[var(--text-muted)] md:text-lg">
              En Challhuahuacho ofrecemos habitaciones Simple Confort con luz natural, descanso
              reparador y una operación confiable para equipos de contrata: check-in/out digital,
              liquidación B2B y soporte las 24 horas.
            </p>
          </div>

          <div className="hotel-rule my-14" />

          <div className="grid gap-10 md:grid-cols-3">
            {[
              ["Wi‑Fi fibra", "Conectividad estable para coordinación de faena y familia."],
              ["Agua caliente 24h", "Confort real a altura de Cotabambas, sin interrupciones."],
              ["Operación minera", "Asignación de guardia, DNI y tickets de auditoría por contrata."],
            ].map(([title, body], i) => (
              <article key={title} className="slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <p className="eyebrow">0{i + 1}</p>
                <h3 className="font-display mt-3 text-2xl md:text-3xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--ink)] py-20 text-[var(--paper)] md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow text-[var(--brass)]">Habitaciones</p>
                <h2 className="font-display mt-3 text-4xl md:text-5xl">Simple Confort</h2>
              </div>
              <Link
                href="/pms"
                className="inline-flex h-11 items-center border border-[var(--brass)] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--brass)] transition hover:bg-[var(--brass)] hover:text-[#1c1915]"
              >
                Abrir rack / PMS
              </Link>
            </div>
            <p className="mt-6 max-w-2xl text-white/70">
              Interiores sobrios, cama 2 plazas, smart TV, calefactor y baño privado. Pensadas para
              descanso profundo después de jornada en altura.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="eyebrow">Información útil</p>
            <h2 className="font-display mt-3 text-4xl">Cómo llegar y contactarnos</h2>
            <p className="mt-4 text-[var(--text-muted)]">{HOTEL.address}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {HOTEL.phones.map((p) => (
                <li key={p.number}>
                  <span className="font-semibold">{p.label}:</span>{" "}
                  <a className="underline decoration-[var(--brass)] underline-offset-4" href={`https://wa.me/${p.whatsapp}`}>
                    {p.number}
                  </a>
                </li>
              ))}
              <li>
                <span className="font-semibold">Email:</span> {HOTEL.email}
              </li>
            </ul>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="eyebrow">Accesos del ecosistema</p>
            <div className="mt-6 grid gap-3">
              {[
                ["/ops", "Centro de operaciones"],
                ["/ops/erp", "ERP / liquidación B2B"],
                ["/concierge", "Conserje virtual 24/7"],
                ["/checkout", "Check-out móvil"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex h-12 items-center justify-between border border-[var(--border)] px-4 text-sm font-semibold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  <span>{label}</span>
                  <span aria-hidden>→</span>
                </Link>
              ))}
            </div>
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
