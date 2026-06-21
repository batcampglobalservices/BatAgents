import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InstallBanner } from "@/components/pwa/InstallBanner";

export const viewport: Viewport = {
  themeColor: "#EA6002",
};

export const metadata: Metadata = {
  title: "Bat Agents — Decentralized AI Agent Marketplace",
  description: "Mint, list, rent, buy, and chat with AI agents on-chain. Fully powered by 0G Chain, 0G Storage, and 0G Compute.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bat Agents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-bg-dark text-white">
        <Providers>
          <Navbar />
          <div className="flex-grow flex flex-col relative">
            {children}
          </div>
          <Footer />
          <InstallBanner />
        </Providers>
      </body>
    </html>
  );
}
