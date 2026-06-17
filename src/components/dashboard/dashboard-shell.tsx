import type { ReactNode } from "react";
import type { AppUser } from "@/types/user";
import DashboardHeader from "./dashboard-header";
import DashboardSidebar, { type DashboardNavItem } from "./dashboard-sidebar";

type DashboardShellProps = {
  title: string;
  description: string;
  user: AppUser;
  roleLabel: string;
  navItems: DashboardNavItem[];
  children: ReactNode;
  accentLabel?: string;
};

export default function DashboardShell({
  title,
  description,
  user,
  roleLabel,
  navItems,
  children,
  accentLabel,
}: DashboardShellProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <DashboardSidebar user={user} navItems={navItems} roleLabel={roleLabel} />
        <div className="space-y-6">
          <DashboardHeader
            title={title}
            description={description}
            user={user}
            roleLabel={roleLabel}
            accentLabel={accentLabel}
          />
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
