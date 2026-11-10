import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { HOTEL } from "@/lib/data/hotel";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[88vh] overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#1d4ed8_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#b45309_0%,transparent_35%),linear-gradient(160deg,#0f172a,#1e3a8a_55%,#0f172a)]"
            aria-hidden
          />
          <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 text-white">
            <p className="slide-up mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Challhuahuacho · Apurímac
            </p>
            <h1 className="font-display slide-up text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {HOTEL.name}
            </h1>
            <p className="slide-up mt-4 max-w-xl text-lg text-slate-200" style={{ animationDelay: "80ms" }}>
              {HOTEL.tagline}. Habitación Simple Confort desde S/ 40 — agua caliente 24h, Wi‑Fi fibra y
              operación lista para contratas mineras.
            </p>
            <div className="slide-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "140ms" }}>
              <Link
                href="/ops"
                className="inline-flex h-12 items-center rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Centro de operaciones
              </Link>
              <Link
                href="/pms"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                PMS / Rack
              </Link>
              <Link
                href="/concierge"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Conserje IA
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Ecosistema Shadai</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
            PMS, ERP de inventarios, liquidación minera parametrizada, check-in digital con firma, IA de
            demanda/precios, mantenimiento preventivo y conserje virtual — con Cloudflare TLS/WAF.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Check-in / Check-out digital", "DNI, firma y tickets de auditoría para guardias de contrata."],
              ["ERP + liquidación B2B", "Inventario, IGV y reportes por cliente minero para cobranza."],
              ["IA + conserje 24/7", "Proyección de ocupación, tarifas dinámicas y asistencia continua."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
          {HOTEL.address} · WhatsApp {HOTEL.phones[0].number}
        </footer>
      </main>
    </div>
  );
}
