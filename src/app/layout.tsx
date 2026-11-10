import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Hospedaje Shadai — Challhuahuacho",
    template: "%s · Hospedaje Shadai",
  },
  description:
    "Hospedaje Shadai — PMS + ERP minero, check-in/out digital, liquidación B2B, IA de demanda, conserje 24/7 y operaciones seguras en Cloudflare.",
  keywords: [
    "Hospedaje Shadai",
    "Challhuahuacho",
    "hotel minero",
    "check-out DNI",
    "liquidación contratas",
  ],
  openGraph: {
    title: "Hospedaje Shadai",
    description: "Plataforma operativa para hospedaje minero en Challhuahuacho.",
    locale: "es_PE",
    type: "website",
  },
  applicationName: "Hospedaje Shadai",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Shadai",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4ed8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
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
