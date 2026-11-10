import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Hospedaje Shadai — Challhuahuacho",
    template: "%s · Hospedaje Shadai",
  },
  description:
    "Hospedaje Shadai en Challhuahuacho: descanso altoandino, operación para contratas mineras, check-in/out digital y hospitalidad con carácter.",
  keywords: [
    "Hospedaje Shadai",
    "Challhuahuacho",
    "hotel Apurímac",
    "contratas mineras",
    "check-out DNI",
  ],
  openGraph: {
    title: "Hospedaje Shadai",
    description: "Hospitalidad altoandina en Challhuahuacho, Cotabambas.",
    locale: "es_PE",
    type: "website",
  },
  applicationName: "Hospedaje Shadai",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/logo-shadai.png", type: "image/png" }],
    apple: [{ url: "/logo-shadai.png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Shadai",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
