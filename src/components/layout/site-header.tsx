"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/** Público: solo Conserje + Check-in. El resto vive en /app (admin). */
const publicLinks = [
  { href: "/concierge", label: "Conserje" },
  { href: "/guest/checkin", label: "Check-in" },
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
          ? "absolute inset-x-0 top-0 border-b border-white/15 bg-gradient-to-b from-black/50 to-transparent"
          : "sticky top-0 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-20">
        <Link href="/" className="flex items-center gap-2" aria-label="Hospedaje Shadai">
          <BrandLogo size="md" priority className={overHero ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" : ""} />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Público">
          {publicLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition",
                  overHero
                    ? active
                      ? "text-white"
                      : "text-white/75 hover:text-white"
                    : active
                      ? "text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/guest/checkin"
            className={cn(
              "ml-1 inline-flex h-10 items-center border px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition",
              overHero
                ? "border-white/70 bg-white text-[#2d3137] hover:bg-white/90"
                : "border-[var(--text)] bg-[var(--text)] text-[var(--bg)] hover:opacity-90"
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
        </nav>
      </div>
    </header>
  );
}
