"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Home, Compass, MessageSquare, LayoutDashboard, PlusCircle } from "lucide-react";

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const tabs = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Marketplace", href: "/marketplace", icon: <Compass className="w-5 h-5" /> },
    { name: "Create", href: "/create", icon: <PlusCircle className="w-5 h-5" /> },
    { name: "Workspaces", href: "/dashboard/buyer", icon: <MessageSquare className="w-5 h-5" />, authRequired: true },
    { name: "Creator Hub", href: "/dashboard/creator", icon: <LayoutDashboard className="w-5 h-5" />, authRequired: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-950/95 border-t border-white/5 backdrop-blur-lg z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          if (tab.authRequired && !isConnected) return null;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                active ? "text-[#EA6002]" : "text-white/50 hover:text-white"
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? "bg-[#EA6002]/10" : ""}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-semibold mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
