"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Hotel" },
  { href: "/pms", label: "Habitaciones" },
  { href: "/ops", label: "Operaciones" },
  { href: "/checkout", label: "Check-out" },
  { href: "/concierge", label: "Conserje" },
];

export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "hero" }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const overHero = variant === "hero";

  return (
    <header
      className={cn(
        "z-40 w-full transition",
        overHero
          ? "absolute inset-x-0 top-0 border-b border-white/15 bg-gradient-to-b from-black/45 to-transparent"
          : "sticky top-0 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-20">
        <Link
          href="/"
          className={cn(
            "font-display text-2xl tracking-[0.04em] md:text-[1.7rem]",
            overHero ? "text-white" : "text-[var(--text)]"
          )}
        >
          Hospedaje <span className="text-[var(--brass)]">Shadai</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition",
                overHero
                  ? pathname === l.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                  : pathname === l.href
                    ? "text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/guest/checkin"
            className={cn(
              "hidden h-10 items-center border px-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition sm:inline-flex",
              overHero
                ? "border-white/70 text-white hover:bg-white hover:text-[var(--ink)]"
                : "border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            )}
          >
            Reservar / Check-in
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            className={cn(
              "grid h-10 w-10 place-items-center border transition",
              overHero
                ? "border-white/40 text-white hover:bg-white/10"
                : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            )}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
