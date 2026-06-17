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
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(3,7,18,0.28)] backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
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

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
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
