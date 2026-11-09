import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutApp } from "@/components/checkout/checkout-app";

export const metadata: Metadata = {
  title: "Check-out móvil",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-sm text-[var(--text-muted)]">
          Cargando check-out…
        </div>
      }
    >
      <CheckoutApp />
    </Suspense>
  );
}
