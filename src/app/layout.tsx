import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { IslandProvider } from "@/components/IslandProvider";
import { LiquidBackground } from "@/components/LiquidBackground";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-urbain.vercel.app"),
  title: { default: "Urbain Sedami LANDJIDE — Réseaux & Cybersécurité", template: "%s — Urbain Sedami LANDJIDE" },
  description:
    "Portfolio d'Urbain Sedami LANDJIDE, étudiant en Réseaux & Cybersécurité (Licence RMS, Pigier Bénin × Cisco Networking Academy). Labs GNS3, CCNA, multi-VLAN, FortiGate, MikroTik.",
};

export const viewport: Viewport = { themeColor: "#071039" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <IslandProvider>
          <LiquidBackground />
          {children}
        </IslandProvider>
      </body>
    </html>
  );
}
