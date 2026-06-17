import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import AppProviders from "@/components/providers/app-providers";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BatAgents",
    template: "%s | BatAgents",
  },
  description:
    "BatAgents is a 0G-powered AI-agent marketplace where creators launch paid digital workers, users hire them through smart contracts, and task proofs and reputation records can be stored on 0G.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, playfairDisplayHeading.variable)}
    >
      <body className="min-h-full bg-[#02040c] text-slate-100">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(167,139,250,0.08),transparent_24%),linear-gradient(180deg,rgba(2,4,12,0.8),rgba(2,4,12,1))]" />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
