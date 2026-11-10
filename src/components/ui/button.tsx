import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--brand)] text-[var(--paper)] hover:bg-[var(--brand-hover)]",
        secondary:
          "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--ink)]",
        gold: "bg-[var(--gold)] text-[var(--gold-fg)] hover:brightness-105",
        danger: "bg-[var(--danger)] text-white hover:brightness-95",
        ghost: "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
      },
      size: {
        sm: "h-9 px-3 text-xs uppercase tracking-[0.14em]",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
