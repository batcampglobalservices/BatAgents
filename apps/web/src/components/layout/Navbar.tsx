"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "../wallet/ConnectButton";
import { Menu, X, LayoutDashboard, Compass, PlusSquare, ShieldCheck, User } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Create Agent", href: "/create" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="p-1 bg-brand/10 rounded-lg group-hover:scale-115 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="Bat Agents Logo"
                  className="w-7 h-7 object-contain"
                />
              </span>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand transition-colors whitespace-nowrap">
                Bat <span className="text-brand">Agents</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand ${
                  isActive(link.href) ? "text-brand" : "text-white/70"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Dashboards (Connected only) */}
            {isConnected && (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <Link
                  href="/dashboard/creator"
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand ${
                    pathname.startsWith("/dashboard/creator") ? "text-brand" : "text-white/70"
                  }`}
                >
                  <PlusSquare className="w-4 h-4" />
                  Creator
                </Link>
                <Link
                  href="/dashboard/buyer"
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand ${
                    pathname.startsWith("/dashboard/buyer") ? "text-brand" : "text-white/70"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Buyer
                </Link>
              </div>
            )}
          </div>

          {/* Wallet connect */}
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/5 px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-bg-dark/95 backdrop-blur-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "bg-brand/10 text-brand"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isConnected && (
            <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
              <Link
                href="/dashboard/creator"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/dashboard/creator")
                    ? "bg-brand/10 text-brand"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <PlusSquare className="w-5 h-5" />
                Creator Dashboard
              </Link>
              <Link
                href="/dashboard/buyer"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/dashboard/buyer")
                    ? "bg-brand/10 text-brand"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <User className="w-5 h-5" />
                Buyer Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
