import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const tones = {
  neutral: "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  info: "bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/30",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
