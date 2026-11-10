import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const tones = {
  success: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-200",
  warning: "bg-amber-500/15 text-amber-900 border-amber-500/30 dark:text-amber-200",
  danger: "bg-rose-500/15 text-rose-800 border-rose-500/30 dark:text-rose-200",
  info: "bg-sky-500/15 text-sky-900 border-sky-500/30 dark:text-sky-200",
  neutral: "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]",
  brass: "bg-[color-mix(in_oklab,var(--brass)_18%,transparent)] text-[var(--text)] border-[color-mix(in_oklab,var(--brass)_35%,transparent)]",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
