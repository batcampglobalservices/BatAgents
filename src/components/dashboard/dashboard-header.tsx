import type { AppUser } from "@/types/user";

type DashboardHeaderProps = {
  title: string;
  description: string;
  user: AppUser;
  roleLabel: string;
  accentLabel?: string;
};

function formatJoinedDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardHeader({
  title,
  description,
  user,
  roleLabel,
  accentLabel,
}: DashboardHeaderProps) {
  const theme =
    roleLabel.toLowerCase() === "creator"
      ? "from-violet-500/15 via-white/5 to-cyan-400/10"
      : roleLabel.toLowerCase() === "buyer"
        ? "from-cyan-500/15 via-white/5 to-emerald-400/10"
        : "from-amber-500/15 via-white/5 to-rose-400/10";

  return (
    <header className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${theme} p-6 shadow-[0_20px_80px_rgba(3,7,18,0.28)] backdrop-blur`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_28%)]" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            {accentLabel ?? "Live workspace"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            {description}
          </p>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-2 lg:w-[360px]">
          <Badge label="Role" value={roleLabel} />
          <Badge label="Wallet" value={user.walletAddress ?? "No wallet"} />
          <Badge label="Joined" value={formatJoinedDate(user.joinedAt)} />
          <Badge label="User" value={user.name} />
        </div>
      </div>
    </header>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-white">{value}</p>
    </div>
  );
}
