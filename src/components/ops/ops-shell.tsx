"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/ops", label: "Dashboard" },
  { href: "/ops/erp", label: "ERP / Liquidación" },
  { href: "/ops/ai", label: "IA & Demanda" },
  { href: "/ops/admin", label: "Backoffice" },
  { href: "/ops/maintenance", label: "Mantenimiento" },
  { href: "/ops/security", label: "Seguridad" },
  { href: "/guest/checkin", label: "Check-in" },
  { href: "/concierge", label: "Conserje" },
];

export function OpsShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]">
          <p className="px-2 pb-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--brass)]">
            Shadai Ops · Las Bambas
          </p>
          <nav className="flex flex-col gap-0.5" aria-label="Operaciones">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2.5 text-sm font-semibold transition",
                  pathname === item.href
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <header className="mb-7 border-b border-[var(--border)] pb-5">
            <p className="eyebrow">Centro de operaciones</p>
            <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-3xl text-[var(--text-muted)]">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
