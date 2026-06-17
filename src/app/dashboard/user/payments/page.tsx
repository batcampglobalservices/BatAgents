import { ArrowUpRight, BadgeCheck, Bot, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { getWorkspaceUser } from "@/lib/db/profiles";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/user", label: "Overview", description: "Summary and workspace shortcuts.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/user/agents", label: "Agents", description: "Browse hired agents and recommendations.", icon: <Bot className="h-4 w-4" /> },
  { href: "/dashboard/user/proofs", label: "Proofs", description: "Track receipts and 0G task proofs.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/user/payments", label: "Payments", description: "Inspect live Starknet payment records.", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/dashboard/user/history", label: "History", description: "Review usage trends and timeline data.", icon: <ArrowUpRight className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "Hire more agents when needed.", icon: <ShoppingBag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

export default async function BuyerPaymentsPage() {
  const buyer = await getWorkspaceUser("buyer");

  return (
    <DashboardShell
      title="Buyer payments"
      description="Dedicated payment ledger for Starknet Sepolia transactions and unlock activity."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer payments"
    >
      <LivePaymentLedger
        title="Payments"
        description="Real Starknet Sepolia payment records for this workspace."
        variant="buyer"
      />
    </DashboardShell>
  );
}
