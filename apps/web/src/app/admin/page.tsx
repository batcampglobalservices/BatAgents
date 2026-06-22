"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminDataService, PlatformMetrics, SecurityEvent, AdminTransaction } from "@/lib/admin/adminDataService";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { RiskBadge } from "@/components/admin/RiskBadge";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [txs, setTxs] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await adminDataService.loadData();
      setMetrics(adminDataService.getPlatformMetrics());
      setEvents(adminDataService.getSecurityEvents().slice(0, 3));
      setTxs(adminDataService.getTransactions().slice(0, 4));
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          title="Total Platform Revenue"
          value={metrics.totalRevenueVolume}
          change="12.5%"
          isPositive={true}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <AdminStatCard
          title="Active AI Agents"
          value={metrics.totalAgents}
          change="4.8%"
          isPositive={true}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 10.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="m19.07 10.93-1.41 1.41" />
              <path d="m6.34 17.66-1.41 1.41" />
            </svg>
          }
        />
        <AdminStatCard
          title="Security Alerts"
          value={metrics.suspiciousActivityCount}
          change="20%"
          isPositive={false}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          }
        />
        <AdminStatCard
          title="Pending Abuse Reports"
          value={metrics.pendingReportsCount}
          change="0.0%"
          isPositive={true}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
          }
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score & Trend SVG Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Platform Transactions Trend</h3>
            <span className="text-xs text-zinc-500 font-mono">Last 7 Days</span>
          </div>
          
          {/* Simple Vector Graph Representation */}
          <div className="h-48 w-full bg-zinc-950/50 rounded-lg border border-zinc-850 p-2 flex flex-col justify-between relative overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-5 pointer-events-none">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            {/* SVG line */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Area under curve */}
              <path
                d="M 0 90 Q 15 50 30 75 T 60 30 T 90 20 L 100 20 L 100 100 L 0 100 Z"
                fill="url(#gradient-area)"
                opacity="0.15"
              />
              {/* Curve line */}
              <path
                d="M 0 90 Q 15 50 30 75 T 60 30 T 90 20 L 100 20"
                fill="none"
                stroke="#EA6002"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EA6002" />
                  <stop offset="100%" stopColor="#EA6002" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels */}
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1 px-1">
              <span>June 15</span>
              <span>June 17</span>
              <span>June 19</span>
              <span>June 21 (Today)</span>
            </div>
          </div>
        </div>

        {/* Security Overview Status Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Platform Security Status</h3>
          <div className="space-y-4">
            <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Overall Risk Rating</span>
                <span className="text-sm font-bold text-white">SECURE (LOW RISK)</span>
              </div>
              <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">94%</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Operational Checks</span>
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between items-center py-1 border-b border-zinc-850">
                  <span>0G Chain Connection</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-850">
                  <span>0G Storage Node Ping</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> 24ms</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Compute Router API</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Responsive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Security Events */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Recent Security Alerts</h3>
            <Link href="/admin/security" className="text-xs text-brand hover:underline font-semibold">View All</Link>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-zinc-500 text-xs py-8 text-center">No recent security alerts.</div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700/60 transition-all flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{ev.type}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{ev.details}</p>
                  </div>
                  <RiskBadge level={ev.riskLevel} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Recent Operations</h3>
            <Link href="/admin/transactions" className="text-xs text-brand hover:underline font-semibold">View All</Link>
          </div>

          <div className="space-y-3">
            {txs.length === 0 ? (
              <div className="text-zinc-500 text-xs py-8 text-center">No recent transactions or platform operations.</div>
            ) : (
              txs.map((tx) => (
                <div key={tx.hash} className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300 font-semibold">{tx.actionType}</span>
                      <span className="text-xs text-white font-mono truncate max-w-[120px]">{tx.wallet}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block font-mono">Hash: {tx.hash.slice(0, 16)}...</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-200 block">{tx.amount}</span>
                    <span className={`text-[10px] uppercase font-semibold ${
                      tx.status === "success" ? "text-green-400" : tx.status === "failed" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
