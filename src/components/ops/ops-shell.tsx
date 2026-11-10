"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/ops", label: "Resumen" },
  { href: "/ops/erp", label: "ERP / B2B" },
  { href: "/ops/ai", label: "IA demanda" },
  { href: "/ops/maintenance", label: "Mantenimiento" },
  { href: "/ops/security", label: "Seguridad" },
  { href: "/guest/checkin", label: "Check-in" },
  { href: "/concierge", label: "Conserje IA" },
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
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">
            Operaciones
          </p>
          <nav className="flex flex-col gap-1" aria-label="Operaciones">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  pathname === item.href
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>
          <header className="mb-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-[var(--text-muted)]">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
