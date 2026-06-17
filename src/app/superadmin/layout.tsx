import type { ReactNode } from "react";
import { BadgeCheck, Bot, Flag, LayoutDashboard, ReceiptText, Users } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";
import { getMockUserByRole } from "@/data/users";

const navItems = [
  { href: "/superadmin", label: "Overview", description: "Platform command center and proof status.", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/superadmin/users", label: "Users", description: "Inspect buyer, creator, and admin accounts.", icon: <Users className="h-4 w-4" /> },
  { href: "/superadmin/agents", label: "Agents", description: "Review all listed AI workers.", icon: <Bot className="h-4 w-4" /> },
  { href: "/superadmin/transactions", label: "Transactions", description: "Follow platform payment activity.", icon: <ReceiptText className="h-4 w-4" /> },
  { href: "/superadmin/proofs", label: "0G proofs", description: "Check proof receipts and storage status.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/superadmin/reports", label: "Reports", description: "Track flagged agents and moderation queue.", icon: <Flag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Superadmin console"
      description="Oversee users, agents, transactions, 0G proof receipts, and reports from a single operational workspace."
      user={getMockUserByRole("superadmin")}
      roleLabel="Superadmin"
      navItems={navItems}
      accentLabel="0G operations console"
    >
      {children}
    </DashboardShell>
  );
}
