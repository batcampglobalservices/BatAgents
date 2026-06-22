"use client";

import React, { useState, useEffect } from "react";
import { adminDataService, SecurityEvent } from "@/lib/admin/adminDataService";
import { RiskBadge } from "@/components/admin/RiskBadge";

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [riskFilter, setRiskFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await adminDataService.loadData();
      setEvents(adminDataService.getSecurityEvents());
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

  const handleResolveEvent = (eventId: string) => {
    adminDataService.resolveSecurityEvent(eventId);
    setEvents([...adminDataService.getSecurityEvents()]);
    alert(`Security alert ${eventId} marked as resolved.`);
  };

  const filteredEvents = events.filter(e => {
    return riskFilter === "all" || e.riskLevel === riskFilter;
  });

  const getSeverityCount = (level: "low" | "medium" | "high" | "critical") => {
    return events.filter(e => e.riskLevel === level && !e.resolved).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert Severity Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-mono block">CRITICAL</span>
            <span className="text-xl font-bold text-red-500">{getSeverityCount("critical")}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-mono block">HIGH</span>
            <span className="text-xl font-bold text-orange-500">{getSeverityCount("high")}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-mono block">MEDIUM</span>
            <span className="text-xl font-bold text-yellow-500">{getSeverityCount("medium")}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-mono block">LOW</span>
            <span className="text-xl font-bold text-green-500">{getSeverityCount("low")}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Filter and Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Real-time Platform Signals</h3>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-zinc-500 text-xs py-8 text-center">No security signals detected.</div>
          ) : (
            filteredEvents.map((ev) => (
              <div key={ev.id} className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-white">{ev.type}</span>
                    <RiskBadge level={ev.riskLevel} />
                    {ev.resolved && (
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-semibold uppercase">
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300">{ev.details}</p>
                  
                  <div className="flex gap-4 text-[10px] text-zinc-500 font-mono">
                    <span>Alert ID: {ev.id}</span>
                    {ev.wallet && <span>Wallet: {ev.wallet}</span>}
                    <span>Detected: {new Date(ev.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {!ev.resolved ? (
                    <button
                      onClick={() => handleResolveEvent(ev.id)}
                      className="px-3 py-1.5 bg-brand text-white hover:bg-brand/90 rounded text-xs font-semibold transition-all shadow"
                    >
                      Acknowledge & Resolve
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono italic">Acknowledged</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
