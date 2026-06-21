"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Overview",
      path: "/admin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: "Agents",
      path: "/admin/agents",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      )
    },
    {
      name: "Transactions",
      path: "/admin/transactions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      name: "Reports & Abuse",
      path: "/admin/reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.2 2h-.4a2 2 0 0 0-2 2v1.2a2 2 0 0 1-1.2 1.8l-1.2.6A2 2 0 0 0 6 9.4V11a2 2 0 0 1-2 2H3a1 1 0 0 0-1 1v2a2 2 0 0 0 2 2h3a2 2 0 0 1 2 2v1.6a2 2 0 0 0 1.2 1.8l1.2.6a2 2 0 0 0 1.6-1.8V20" />
          <path d="M12 5.8V2" />
          <path d="m19 14 3-3-3-3" />
          <path d="M11.5 14H22" />
        </svg>
      )
    },
    {
      name: "Security Signals",
      path: "/admin/security",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
          B
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-white">BAT AGENTS</h2>
          <p className="text-[10px] text-brand uppercase font-mono tracking-widest font-semibold">Ops Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand/10 text-brand border-l-2 border-brand"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className={isActive ? "text-brand" : "text-zinc-500"}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Marketplace
        </Link>
      </div>
    </aside>
  );
};
