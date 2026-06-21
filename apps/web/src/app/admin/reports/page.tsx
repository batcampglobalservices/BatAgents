"use client";

import React, { useState, useEffect } from "react";
import { adminDataService, AdminReport } from "@/lib/admin/adminDataService";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    setReports(adminDataService.getReports());
  }, []);

  const handleUpdateStatus = (reportId: string, status: "open" | "reviewing" | "resolved" | "dismissed") => {
    adminDataService.updateReportStatus(reportId, status, noteInput || undefined);
    setReports([...adminDataService.getReports()]);
    setSelectedReport(null);
    setNoteInput("");
    alert(`Report ${reportId} status updated to ${status}`);
  };

  const filteredReports = reports.filter(r => {
    return statusFilter === "all" || r.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-4 rounded-xl items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Filter by Status</h2>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
          >
            <option value="all">All Reports</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reports list */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Active Abuse Logs</h3>

          {filteredReports.length === 0 ? (
            <div className="text-zinc-500 text-xs py-8 text-center">No reports match the status filter.</div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setNoteInput(report.adminNotes || "");
                  }}
                  className={`p-4 bg-zinc-950/40 border rounded-lg hover:border-zinc-700/60 transition-all cursor-pointer flex justify-between items-start ${
                    selectedReport?.id === report.id ? "border-brand bg-brand/5" : "border-zinc-800/80"
                  }`}
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{report.id}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300 font-semibold">{report.reason.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{report.description}</p>
                    <div className="flex gap-4 text-[10px] text-zinc-500 font-mono">
                      <span>Target: {report.targetWalletOrAgent}</span>
                      <span>Reporter: {report.reporter.slice(0, 6)}...</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    report.status === "open" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    report.status === "reviewing" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                    report.status === "resolved" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                    "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed action menu */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Resolution Action Desk</h3>
          
          {selectedReport ? (
            <div className="space-y-4">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div>
                  <span className="text-zinc-500 font-mono block">Report ID:</span>
                  <span className="text-white font-semibold">{selectedReport.id}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono block">Target:</span>
                  <span className="text-white font-semibold font-mono break-all">{selectedReport.targetWalletOrAgent} ({selectedReport.targetType})</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono block">Full Description:</span>
                  <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-850 mt-1 font-sans">{selectedReport.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-zinc-500 font-mono block">Resolution Notes:</span>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record why this case was resolved, dismissed, or escalation steps..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand/50"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedReport.status !== "reviewing" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "reviewing")}
                    className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded font-semibold transition-all"
                  >
                    Set Reviewing
                  </button>
                )}
                {selectedReport.status !== "resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                    className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded font-semibold transition-all"
                  >
                    Resolve Report
                  </button>
                )}
                {selectedReport.status !== "dismissed" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 border border-zinc-700 rounded font-semibold transition-all"
                  >
                    Dismiss Report
                  </button>
                )}
                {selectedReport.status !== "open" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "open")}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded font-semibold transition-all col-span-2"
                  >
                    Reopen Case
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-xs py-8 text-center font-sans">
              Select a report from the list to view full details and execute actions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
