import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "brass" | "ok" | "warn" | "danger";
  className?: string;
}) {
  const toneBar = {
    default: "bg-[var(--ink)]",
    brass: "bg-[var(--brass)]",
    ok: "bg-emerald-600",
    warn: "bg-amber-500",
    danger: "bg-rose-600",
  }[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5",
        className
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", toneBar)} />
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl tracking-tight text-[var(--text)] md:text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
