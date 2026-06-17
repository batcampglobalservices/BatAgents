"use client";

import { motion } from "motion/react";
import { useMemo, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BadgeCheck, Coins, ReceiptText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStoredCreatedAgentsSnapshot, subscribeCreatedAgentsStore } from "@/lib/created-agents";
import { getStoredHiresSnapshot, subscribeHiresStore } from "@/lib/hires";
import { getStoredTaskProofsSnapshot, subscribeTaskProofsStore } from "@/lib/task-proofs";
import { getStoredTransactionsSnapshot, subscribeTransactionsStore } from "@/lib/transactions";
import { mergePublishedAgents } from "@/lib/created-agents";
import { agents as staticAgents } from "@/data/agents";
import { cn } from "@/lib/utils";
import type { HireRecord, PaymentTransactionRecord } from "@/types/payment";
import type { TaskProof } from "@/types/0g";

type ChartPoint = {
  label: string;
  amount: number;
  count: number;
};

type UsageHistoryPanelProps = {
  walletAddress?: string;
};

export default function UsageHistoryPanel({ walletAddress }: UsageHistoryPanelProps) {
  useSyncExternalStore(subscribeCreatedAgentsStore, getStoredCreatedAgentsSnapshot, () => "[]");
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
  const proofsSnapshot = useSyncExternalStore(
    subscribeTaskProofsStore,
    getStoredTaskProofsSnapshot,
    () => "[]",
  );

  const transactions = useMemo(
    () => parseJson<PaymentTransactionRecord[]>(transactionsSnapshot),
    [transactionsSnapshot],
  );
  const hires = useMemo(() => parseJson<HireRecord[]>(hiresSnapshot), [hiresSnapshot]);
  const proofs = useMemo(() => parseJson<TaskProof[]>(proofsSnapshot), [proofsSnapshot]);
  const publishedAgents = mergePublishedAgents(staticAgents);
  const scopedTransactions = useMemo(
    () =>
      walletAddress
        ? transactions.filter(
            (transaction) =>
              transaction.buyerWallet.toLowerCase() === walletAddress.toLowerCase(),
          )
        : transactions,
    [transactions, walletAddress],
  );
  const scopedHires = useMemo(
    () =>
      walletAddress
        ? hires.filter((hire) => hire.buyerWallet.toLowerCase() === walletAddress.toLowerCase())
        : hires,
    [hires, walletAddress],
  );
  const scopedProofs = useMemo(
    () =>
      walletAddress
        ? proofs.filter((proof) => proof.buyerWallet.toLowerCase() === walletAddress.toLowerCase())
        : proofs,
    [proofs, walletAddress],
  );

  const summary = useMemo(() => {
    const successfulTransactions = scopedTransactions.filter((item) => item.status === "successful");
    const totalSpend = successfulTransactions.reduce((sum, item) => sum + item.amount, 0);
    const unlockedAgents = new Set(scopedHires.map((item) => item.agentId)).size;
    const categories = new Map<string, number>();

    for (const agent of publishedAgents) {
      categories.set(agent.category, (categories.get(agent.category) ?? 0) + 1);
    }

    return {
      totalSpend,
      totalTransactions: scopedTransactions.length,
      totalHires: scopedHires.length,
      totalProofs: scopedProofs.length,
      unlockedAgents,
      categories: Array.from(categories.entries()).map(([name, value]) => ({ name, value })),
    };
  }, [publishedAgents, scopedHires, scopedProofs, scopedTransactions]);

  const spendChart = useMemo(
    () => buildDailyTrend(scopedTransactions.map((item) => ({ createdAt: item.createdAt, amount: item.amount }))),
    [scopedTransactions],
  );
  const hireChart = useMemo(
    () => buildDailyTrend(scopedHires.map((item) => ({ createdAt: item.createdAt, amount: 1 }))),
    [scopedHires],
  );
  const proofChart = useMemo(
    () => buildDailyTrend(scopedProofs.map((item) => ({ createdAt: item.completedAt, amount: 1 }))),
    [scopedProofs],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Confirmed spend", value: `${summary.totalSpend} ETH`, icon: Coins },
          { label: "Transaction hashes", value: String(summary.totalTransactions), icon: ReceiptText },
          { label: "Unlocked agents", value: String(summary.unlockedAgents), icon: BadgeCheck },
          { label: "Proof records", value: String(summary.totalProofs), icon: ShieldCheck },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
              className="border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </motion.div>
          );
        })}
      </section>

      <Tabs defaultValue="spend" className="space-y-4">
        <TabsList variant="line" className="border border-white/10 bg-slate-950/60 p-1">
          <TabsTrigger value="spend">Spend</TabsTrigger>
          <TabsTrigger value="hires">Hires</TabsTrigger>
          <TabsTrigger value="proofs">Proofs</TabsTrigger>
        </TabsList>

        <TabsContent value="spend">
          <ChartCard
            title="Payment history"
            description="Confirmed Starknet Sepolia spend and transaction activity."
            chartData={spendChart}
            color="rgba(103, 232, 249, 0.95)"
            mode="area"
          />
        </TabsContent>

        <TabsContent value="hires">
          <ChartCard
            title="Hire activity"
            description="Live hire confirmations grouped by day."
            chartData={hireChart}
            color="rgba(167, 139, 250, 0.95)"
            mode="bar"
          />
        </TabsContent>

        <TabsContent value="proofs">
          <ChartCard
            title="Proof creation"
            description="0G proof saves and task receipt activity."
            chartData={proofChart}
            color="rgba(52, 211, 153, 0.95)"
            mode="area"
          />
        </TabsContent>
      </Tabs>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-slate-950/60 text-white">
          <CardHeader>
            <CardTitle>Agent mix</CardTitle>
            <CardDescription>Published agents by category from the live store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.categories.length > 0 ? (
              summary.categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-200">{category.name}</span>
                  <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                    {category.value}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                No published agents yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/60 text-white">
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
            <CardDescription>Recent confirmations across hires, payments, and proofs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {buildTimeline(scopedTransactions, scopedHires, scopedProofs).slice(0, 6).map((item) => (
              <div key={item.key} className="border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    item.tone === "emerald"
                      ? "bg-emerald-400/10 text-emerald-100"
                      : item.tone === "violet"
                        ? "bg-violet-400/10 text-violet-100"
                        : "bg-cyan-400/10 text-cyan-100",
                  )}>
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{item.subtitle}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ChartCard({
  title,
  description,
  chartData,
  color,
  mode,
}: {
  title: string;
  description: string;
  chartData: ChartPoint[];
  color: string;
  mode: "area" | "bar";
}) {
  return (
    <Card className="border-white/10 bg-slate-950/60 text-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {mode === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(148,163,184,0.6)" />
                <YAxis tickLine={false} axisLine={false} stroke="rgba(148,163,184,0.6)" />
                <Tooltip
                  cursor={{ stroke: "rgba(103,232,249,0.2)" }}
                  contentStyle={{
                    background: "#050816",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke={color} fill="url(#usageGradient)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(148,163,184,0.6)" />
                <YAxis tickLine={false} axisLine={false} stroke="rgba(148,163,184,0.6)" />
                <Tooltip
                  cursor={{ fill: "rgba(103,232,249,0.08)" }}
                  contentStyle={{
                    background: "#050816",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill={color} radius={[10, 10, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-sm text-slate-400">
            No history yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildDailyTrend(items: { createdAt: string; amount: number }[]): ChartPoint[] {
  const grouped = new Map<string, ChartPoint>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = grouped.get(label);

    if (existing) {
      existing.amount += item.amount;
      existing.count += 1;
      continue;
    }

    grouped.set(label, { label, amount: item.amount, count: 1 });
  }

  return Array.from(grouped.values()).slice(0, 7).reverse();
}

function buildTimeline(
  transactions: PaymentTransactionRecord[],
  hires: HireRecord[],
  proofs: TaskProof[],
) {
  return [
    ...transactions.map((transaction) => ({
      key: transaction.id,
      title: transaction.agentName,
      subtitle: `${transaction.amount} ${transaction.currency} · ${new Date(transaction.createdAt).toLocaleDateString("en-US")}`,
      type: transaction.status,
      tone: transaction.status === "successful" ? "emerald" : transaction.status === "failed" ? "rose" : "cyan",
      timestamp: new Date(transaction.createdAt).getTime(),
    })),
    ...hires.map((hire) => ({
      key: hire.id,
      title: hire.agentId,
      subtitle: `${hire.amount} ${hire.currency} · ${new Date(hire.createdAt).toLocaleDateString("en-US")}`,
      type: hire.status,
      tone: hire.status === "paid" || hire.status === "completed" ? "emerald" : "cyan",
      timestamp: new Date(hire.createdAt).getTime(),
    })),
    ...proofs.map((proof) => ({
      key: proof.id,
      title: proof.agentId,
      subtitle: new Date(proof.completedAt).toLocaleDateString("en-US"),
      type: "proof",
      tone: "violet",
      timestamp: new Date(proof.completedAt).getTime(),
    })),
  ].sort((left, right) => right.timestamp - left.timestamp);
}

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return [] as T;
  }
}
