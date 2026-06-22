"use client";

import React, { useState, useEffect } from "react";
import { adminDataService, AdminAgent } from "@/lib/admin/adminDataService";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await adminDataService.loadData();
      setAgents(adminDataService.getAgents());
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

  const handleToggleActive = (tokenId: number, currentActive: boolean) => {
    adminDataService.toggleAgentActive(tokenId, !currentActive);
    setAgents([...adminDataService.getAgents()]);
  };

  const handleListingStatusChange = (tokenId: number, status: "listed" | "delisted" | "not_listed") => {
    adminDataService.updateAgentListingStatus(tokenId, status);
    setAgents([...adminDataService.getAgents()]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Metadata URI copied to clipboard!");
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(search.toLowerCase()) || 
      agent.creator.toLowerCase().includes(search.toLowerCase()) ||
      agent.metadataHash.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search by agent name, creator wallet, or storage hash..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Categories</option>
            <option value="Finance">Finance</option>
            <option value="Data">Data</option>
            <option value="Utility">Utility</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                <th className="py-4 px-5">Agent ID / Name</th>
                <th className="py-4 px-5">Creator</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">0G Storage Metadata</th>
                <th className="py-4 px-5">Usage & Reports</th>
                <th className="py-4 px-5">Listing Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No live agents listed yet. Create and mint the first Bat Agent on 0G testnet.
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No AI agents found matching filters.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.tokenId} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <span className="font-semibold text-white block">{agent.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Token ID: #{agent.tokenId} | Minted: {new Date(agent.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-zinc-400" title={agent.creator}>
                        {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-zinc-400 font-mono">
                      {agent.category}
                    </td>
                    <td className="py-4 px-5 font-mono text-brand font-semibold">
                      {agent.price}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500 text-[10px]" title={agent.metadataURI}>
                          {agent.metadataHash.slice(0, 14)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(agent.metadataURI)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                          title="Copy Metadata Hash"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <div className="flex gap-1 text-[10px]">
                          <span className="text-zinc-500 font-mono">Usage:</span>
                          <span className="text-zinc-300 font-semibold">{agent.usageCount} times</span>
                        </div>
                        <div className="flex gap-1 text-[10px]">
                          <span className="text-zinc-500 font-mono">Reports:</span>
                          <span className={`${agent.reportsCount > 0 ? "text-red-400 font-bold" : "text-zinc-500"}`}>
                            {agent.reportsCount} logs
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          agent.listingStatus === "listed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          agent.listingStatus === "delisted" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse" :
                          "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}>
                          {agent.listingStatus}
                        </span>
                        <span className={`text-[10px] font-mono ${agent.active ? "text-green-400" : "text-red-400"}`}>
                          ● {agent.active ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right space-y-1">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(agent.tokenId, agent.active)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                            agent.active
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                          }`}
                        >
                          {agent.active ? "Disable" : "Enable"}
                        </button>

                        {agent.listingStatus === "listed" ? (
                          <button
                            onClick={() => handleListingStatusChange(agent.tokenId, "delisted")}
                            className="px-2 py-1 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded border border-orange-500/20 text-[10px] font-semibold transition-colors"
                          >
                            Delist
                          </button>
                        ) : (
                          <button
                            onClick={() => handleListingStatusChange(agent.tokenId, "listed")}
                            className="px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded border border-green-500/20 text-[10px] font-semibold transition-colors"
                          >
                            Relist
                          </button>
                        )}
                      </div>
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
