"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, BedDouble } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/pms", label: "Sistema PMS" },
  { href: "/ops", label: "Operaciones" },
  { href: "/checkout", label: "Check-out" },
  { href: "/concierge", label: "Conserje" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand)] text-white">
            <BedDouble className="h-4 w-4" aria-hidden />
          </span>
          Hospedaje Shadai
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                pathname === l.href
                  ? "bg-[var(--surface)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="hidden sm:inline">{theme === "light" ? "Oscuro" : "Claro"}</span>
        </Button>
      </div>
    </header>
  );
}
