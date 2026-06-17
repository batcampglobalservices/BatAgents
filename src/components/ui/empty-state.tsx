import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
