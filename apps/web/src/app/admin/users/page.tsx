"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminDataService, AdminUser } from "@/lib/admin/adminDataService";
import { RiskBadge } from "@/components/admin/RiskBadge";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await adminDataService.loadData();
      setUsers(adminDataService.getUsers());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStatusChange = (wallet: string, status: "active" | "flagged" | "suspended" | "banned", reason?: string) => {
    adminDataService.updateUserStatus(wallet, status, reason);
    // Reload state
    setUsers([...adminDataService.getUsers()]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Wallet address copied to clipboard!");
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.wallet.toLowerCase().includes(search.toLowerCase()) || 
      user.displayName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search by wallet address or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-brand/50 pl-10"
          />
          <svg className="absolute left-3.5 top-2.5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="flagged">Flagged</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Wallet Address</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Security standing</th>
                <th className="py-4 px-5">Financials</th>
                <th className="py-4 px-5">Joined Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No platform wallets found yet. Users will appear after real mint, list, hire, or admin activity happens on testnet.
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No users match the search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.wallet} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-8 h-8 rounded bg-zinc-850 border border-zinc-800"
                        />
                        <div>
                          <span className="font-semibold text-white block">{user.displayName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Last act: {new Date(user.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400">{user.wallet.slice(0, 8)}...{user.wallet.slice(-6)}</span>
                        <button
                          onClick={() => copyToClipboard(user.wallet)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                          title="Copy Wallet Address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold font-mono ${
                        user.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        user.role === "creator" ? "bg-brand/10 text-brand border border-brand/20" :
                        "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          user.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          user.status === "flagged" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          user.status === "suspended" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {user.status}
                        </span>
                        <RiskBadge 
                          level={user.riskScore > 75 ? "critical" : user.riskScore > 50 ? "high" : user.riskScore > 20 ? "medium" : "low"}
                          score={user.riskScore}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <div className="flex gap-1 text-[10px]">
                          <span className="text-zinc-500 font-mono">Spent:</span>
                          <span className="text-zinc-300 font-semibold">{user.totalSpent} 0G</span>
                        </div>
                        <div className="flex gap-1 text-[10px]">
                          <span className="text-zinc-500 font-mono">Earned:</span>
                          <span className="text-brand font-semibold">{user.totalEarned} 0G</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-zinc-400 font-mono">
                      {new Date(user.dateJoined).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1">
                      <Link
                        href={`/admin/users/${user.wallet}`}
                        className="inline-flex items-center px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded hover:text-white transition-colors"
                      >
                        Details
                      </Link>

                      {user.status === "active" && (
                        <button
                          onClick={() => handleStatusChange(user.wallet, "flagged", "Suspicious transaction frequency")}
                          className="inline-flex items-center px-2 py-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded border border-yellow-500/20 transition-colors"
                        >
                          Flag
                        </button>
                      )}

                      {user.status !== "banned" ? (
                        <button
                          onClick={() => handleStatusChange(user.wallet, "banned", "Exploit attempts reported")}
                          className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors"
                        >
                          Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.wallet, "active")}
                          className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded border border-green-500/20 transition-colors"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
