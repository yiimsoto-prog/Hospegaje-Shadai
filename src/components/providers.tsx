"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/lib/store/app-store";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
}
