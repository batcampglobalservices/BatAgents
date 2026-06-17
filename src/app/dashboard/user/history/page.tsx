import { Activity, BadgeCheck, Bot, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import UsageHistoryPanel from "@/components/dashboard/usage-history-panel";
import { getMockUserByRole } from "@/data/users";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/user", label: "Overview", description: "Buyer workspace and live task activity.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/user#agents", label: "Hired agents", description: "Review the agents already on your roster.", icon: <Bot className="h-4 w-4" /> },
  { href: "/dashboard/user#proofs", label: "Task proofs", description: "Track completed work and saved receipts.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/user#payments", label: "Payments", description: "Review Starknet Sepolia payment history.", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/dashboard/user/history", label: "Usage history", description: "See transaction, hire, and proof trends.", icon: <Activity className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "Hire more agents when you need them.", icon: <ShoppingBag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

const buyer = getMockUserByRole("buyer");

export default function BuyerHistoryPage() {
  return (
    <DashboardShell
      title="Usage history"
      description="Review buyer activity, payments, hires, and proof records in one live history view."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer history"
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Live usage</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Track spending, hires, and proof history.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              The charts below are driven by the current local history store, so they stay aligned with actual Starknet payment and task activity.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-medium text-slate-300">
            Updated from local history stores
          </div>
        </div>
      </section>

      <UsageHistoryPanel />
    </DashboardShell>
  );
}
