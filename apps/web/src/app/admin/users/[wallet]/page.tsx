"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminDataService, AdminUser, AdminAgent, AdminTransaction, AdminReport } from "@/lib/admin/adminDataService";
import { RiskBadge } from "@/components/admin/RiskBadge";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const wallet = params.wallet as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [txs, setTxs] = useState<AdminTransaction[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    
    const fetchedUser = adminDataService.getUserByWallet(wallet);
    if (!fetchedUser) {
      return;
    }
    
    setUser(fetchedUser);
    setNotes(fetchedUser.adminNotes || "");
    
    // Filter agents, transactions, and reports
    setAgents(adminDataService.getAgents().filter(a => a.creator.toLowerCase() === wallet.toLowerCase()));
    setTxs(adminDataService.getTransactions().filter(t => t.wallet.toLowerCase() === wallet.toLowerCase()));
    setReports(adminDataService.getReports().filter(
      r => r.reporter.toLowerCase() === wallet.toLowerCase() || 
           r.targetWalletOrAgent.toLowerCase() === wallet.toLowerCase()
    ));
  }, [wallet]);

  const handleStatusChange = (status: "active" | "flagged" | "suspended" | "banned", reason?: string) => {
    if (!user) return;
    adminDataService.updateUserStatus(user.wallet, status, reason);
    setUser({ ...user, status, securityFlagReason: reason });
  };

  const handleSaveNotes = () => {
    if (!user) return;
    setIsSavingNotes(true);
    adminDataService.updateUserNotes(user.wallet, notes);
    
    setTimeout(() => {
      setIsSavingNotes(false);
      setUser({ ...user, adminNotes: notes });
      alert("Admin security notes updated successfully!");
    }, 400);
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users" className="text-brand hover:underline text-xs font-semibold flex items-center gap-1">
          ← Back to Users
        </Link>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center text-zinc-500">
          User wallet <span className="font-mono text-zinc-400">{wallet}</span> not found in database.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Link */}
      <div>
        <Link href="/admin/users" className="text-zinc-400 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Users list
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-20 h-20 rounded bg-zinc-850 border border-zinc-800 p-1"
          />

          <div className="space-y-3 min-w-0 flex-1">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{user.displayName}</h2>
              <span className="font-mono text-xs text-zinc-500 block break-all">{user.wallet}</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold font-mono border border-zinc-700">
                ROLE: {user.role.toUpperCase()}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                user.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                user.status === "flagged" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                user.status === "suspended" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                STATUS: {user.status.toUpperCase()}
              </span>
              <RiskBadge level={user.riskScore > 75 ? "critical" : user.riskScore > 50 ? "high" : user.riskScore > 20 ? "medium" : "low"} score={user.riskScore} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-850/60 text-xs">
              <div>
                <span className="text-zinc-500 block font-mono">Date Joined</span>
                <span className="text-zinc-200 font-medium">{new Date(user.dateJoined).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono">Last Activity</span>
                <span className="text-zinc-200 font-medium">{new Date(user.lastActivity).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono">Total Spent</span>
                <span className="text-zinc-200 font-medium font-mono">{user.totalSpent} 0G</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono">Total Earned</span>
                <span className="text-brand font-medium font-mono">{user.totalEarned} 0G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Action Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Account Security Controls</h3>
          
          {user.securityFlagReason && (
            <div className="p-3 bg-red-500/5 text-red-400 rounded-lg border border-red-500/10 text-xs">
              <span className="font-semibold font-mono uppercase block mb-1">Flag Reason:</span>
              {user.securityFlagReason}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {user.status !== "active" && (
              <button
                onClick={() => handleStatusChange("active")}
                className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded font-semibold transition-all"
              >
                Set Active / Resolve
              </button>
            )}
            {user.status !== "flagged" && (
              <button
                onClick={() => handleStatusChange("flagged", "Flagged manually by admin")}
                className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded font-semibold transition-all"
              >
                Flag Account
              </button>
            )}
            {user.status !== "suspended" && (
              <button
                onClick={() => handleStatusChange("suspended", "Temporary suspension for audit")}
                className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded font-semibold transition-all"
              >
                Suspend Account
              </button>
            )}
            {user.status !== "banned" && (
              <button
                onClick={() => handleStatusChange("banned", "Exploit and terms violation banned")}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded font-semibold transition-all"
              >
                Ban Account
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Admin Notes Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Internal Admin Notes</h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add security audit logs, verified social handles, or support tickets associated with this user..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-brand/50 font-sans"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand/90 transition-all disabled:opacity-50"
          >
            {isSavingNotes ? "Saving Notes..." : "Update Security Notes"}
          </button>
        </div>
      </div>

      {/* User subpages sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Created Agents */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Created AI Agents ({agents.length})</h3>
          
          {agents.length === 0 ? (
            <div className="text-zinc-500 text-xs py-4 text-center">No agents created by this wallet.</div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.tokenId} className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">{agent.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Token ID: #{agent.tokenId} | Cat: {agent.category}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-brand block">{agent.price}</span>
                    <span className={`text-[10px] uppercase font-semibold font-mono ${
                      agent.listingStatus === "listed" ? "text-green-400" : "text-zinc-500"
                    }`}>
                      {agent.listingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions list */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Recent Operations & Txns ({txs.length})</h3>
          
          {txs.length === 0 ? (
            <div className="text-zinc-500 text-xs py-4 text-center">No transaction logs for this wallet.</div>
          ) : (
            <div className="space-y-3">
              {txs.map((tx) => (
                <div key={tx.hash} className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300 font-semibold">{tx.actionType}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Hash: {tx.hash.slice(0, 10)}...</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block font-mono mt-1">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-200 block">{tx.amount}</span>
                    <span className={`text-[10px] uppercase font-semibold ${
                      tx.status === "success" ? "text-green-400" : "text-red-400"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
