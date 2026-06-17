"use client";

import { useMemo, useSyncExternalStore } from "react";
import { BadgeCheck, Coins, ReceiptText, ShieldCheck, UserCheck } from "lucide-react";
import { getStoredHiresSnapshot, subscribeHiresStore } from "@/lib/hires";
import {
  getStoredTransactionsSnapshot,
  subscribeTransactionsStore,
} from "@/lib/transactions";
import { shortenAddress } from "@/lib/starknet-payments";
import type { HireRecord, PaymentTransactionRecord } from "@/types/payment";

type LivePaymentLedgerProps = {
  title: string;
  description: string;
  variant?: "buyer" | "creator" | "admin";
};

export default function LivePaymentLedger({
  title,
  description,
  variant = "admin",
}: LivePaymentLedgerProps) {
  const transactionsSnapshot = useSyncExternalStore(
    subscribeTransactionsStore,
    getStoredTransactionsSnapshot,
    () => "[]",
  );
  const hiresSnapshot = useSyncExternalStore(
    subscribeHiresStore,
    getStoredHiresSnapshot,
    () => "[]",
  );

  const transactions = useMemo(
    () => parseJson<PaymentTransactionRecord[]>(transactionsSnapshot),
    [transactionsSnapshot],
  );
  const hires = useMemo(
    () => parseJson<HireRecord[]>(hiresSnapshot),
    [hiresSnapshot],
  );

  const summary = useMemo(() => {
    const successfulTransactions = transactions.filter(
      (transaction) => transaction.status === "successful",
    );

    const totalAmount = successfulTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    const uniqueAgents = new Set(hires.map((hire) => hire.agentId)).size;

    return {
      totalAmount,
      paymentCount: transactions.length,
      confirmedCount: successfulTransactions.length,
      unlockedAgents: uniqueAgents,
      totalHires: hires.length,
      uniqueBuyers: new Set(transactions.map((transaction) => transaction.buyerWallet)).size,
      uniqueCreators: new Set(
        transactions.map((transaction) => transaction.creatorWallet),
      ).size,
    };
  }, [hires, transactions]);

  const metrics =
    variant === "buyer"
      ? [
          { label: "Spent on Sepolia", value: `${summary.totalAmount} ETH`, icon: Coins },
          { label: "Confirmed unlocks", value: String(summary.unlockedAgents), icon: BadgeCheck },
          { label: "Hires saved", value: String(summary.totalHires), icon: UserCheck },
          { label: "Payment hashes", value: String(summary.confirmedCount), icon: ReceiptText },
        ]
      : variant === "creator"
        ? [
            { label: "Earned on Sepolia", value: `${summary.totalAmount} ETH`, icon: Coins },
            { label: "Confirmed payments", value: String(summary.confirmedCount), icon: BadgeCheck },
            { label: "Transactions", value: String(summary.paymentCount), icon: ReceiptText },
            { label: "Receiver wallets", value: String(summary.uniqueCreators), icon: ShieldCheck },
          ]
        : [
            { label: "Total payments", value: String(summary.paymentCount), icon: ReceiptText },
            { label: "Confirmed", value: String(summary.confirmedCount), icon: BadgeCheck },
            { label: "Unique buyers", value: String(summary.uniqueBuyers), icon: UserCheck },
            { label: "Total volume", value: `${summary.totalAmount} ETH`, icon: Coins },
          ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{description}</h2>
        </div>
        <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
          Starknet Sepolia
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.15fr_1fr_1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-white/10 bg-slate-950/60 px-5 py-4 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>Tx Hash</span>
          <span>Buyer</span>
          <span>Receiver</span>
          <span>Agent</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Network</span>
          <span>Source</span>
          <span>Date</span>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-white/10 bg-slate-950/40">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-[1.15fr_1fr_1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 py-4 text-sm text-slate-200"
              >
                <span className="break-all font-mono text-xs text-slate-300">
                  {shortenAddress(transaction.txHash)}
                </span>
                <span className="break-all text-xs text-slate-300">
                  {shortenAddress(transaction.buyerWallet)}
                </span>
                <span className="break-all text-xs text-slate-300">
                  {shortenAddress(transaction.creatorWallet)}
                </span>
                <span>{transaction.agentName}</span>
                <span>
                  {transaction.amount} {transaction.currency}
                </span>
                <span>
                  <StatusBadge status={transaction.status} />
                </span>
                <span className="text-xs text-cyan-200">{transaction.network}</span>
                <span className="text-xs text-slate-400">
                  {transaction.source ?? "batagents-cairo-contract"}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(transaction.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/40 px-5 py-10 text-sm text-slate-300">
            No Starknet Sepolia payments have been recorded yet. Complete a payment to
            populate this ledger.
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: PaymentTransactionRecord["status"];
}) {
  const styles =
    status === "successful"
      ? "bg-emerald-400/10 text-emerald-100 border-emerald-400/20"
      : status === "initiated"
        ? "bg-amber-400/10 text-amber-100 border-amber-400/20"
        : "bg-rose-400/10 text-rose-100 border-rose-400/20";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

function parseJson<T>(value: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    return [] as T;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
