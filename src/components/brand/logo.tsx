import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  priority?: boolean;
  /** compact = mark for headers; hero = larger brand lockup */
  size?: "sm" | "md" | "lg" | "hero";
};

const sizes = {
  sm: { w: 120, h: 48, className: "h-10 w-auto" },
  md: { w: 160, h: 64, className: "h-12 w-auto md:h-14" },
  lg: { w: 220, h: 88, className: "h-16 w-auto md:h-20" },
  hero: { w: 420, h: 168, className: "h-28 w-auto sm:h-36 md:h-44" },
};

export function BrandLogo({ className, priority, size = "md" }: Props) {
  const s = sizes[size];
  return (
    <Image
      src="/logo-shadai.png"
      alt="Hospedaje Shadai — Bajo la cobertura del Altísimo"
      width={s.w}
      height={s.h}
      priority={priority}
      className={cn(s.className, "object-contain", className)}
    />
  );
}
