"use client";

import React, { useState, useEffect } from "react";
import { adminDataService, AdminTransaction } from "@/lib/admin/adminDataService";

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const explorerUrl = process.env.NEXT_PUBLIC_ZERO_G_EXPLORER_URL || "https://chainscan-galileo.0g.ai";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await adminDataService.loadData();
      setTxs(adminDataService.getTransactions());
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

  const filteredTxs = txs.filter(tx => {
    const matchesSearch = 
      tx.hash.toLowerCase().includes(search.toLowerCase()) || 
      tx.wallet.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || tx.actionType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search by transaction hash or user wallet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-brand/50 pl-10"
          />
          <svg className="absolute left-3.5 top-2.5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Actions</option>
            <option value="mint">Mint</option>
            <option value="list">List</option>
            <option value="purchase">Purchase</option>
            <option value="rent">Rent</option>
            <option value="ppm_purchase">PPM Purchase</option>
            <option value="withdraw">Withdraw</option>
            <option value="update">Update</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                <th className="py-4 px-5">Transaction Hash</th>
                <th className="py-4 px-5">User Wallet</th>
                <th className="py-4 px-5">Action Type</th>
                <th className="py-4 px-5">Agent ID</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No platform transactions found yet.
                  </td>
                </tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No transactions match search filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-zinc-400">
                      <span title={tx.hash}>
                        {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono">
                      <span title={tx.wallet}>
                        {tx.wallet.slice(0, 6)}...{tx.wallet.slice(-4)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {tx.actionType}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono">
                      {tx.agentId > 0 ? `#${tx.agentId}` : "N/A"}
                    </td>
                    <td className="py-4 px-5 font-mono text-zinc-200 font-medium">
                      {tx.amount}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tx.status === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        tx.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-zinc-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <a
                        href={`${explorerUrl}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded text-xs transition-colors"
                      >
                        View
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </a>
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
